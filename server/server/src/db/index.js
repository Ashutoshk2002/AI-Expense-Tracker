/* eslint-disable no-console */
const { logger } = require("../utils/logger");
const { Sequelize } = require("sequelize");
const {
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_HOST,
  ENVIRONMENT_MODE,
} = require("../constants");

const IS_DEV = ENVIRONMENT_MODE === "DEV";

// Persistent connection pool
/**
 * @type {Sequelize} The singleton Sequelize instance
 */
let connectionPool;

const slowQueryLogger = (sql, timing) => {
  if (timing > 1000) {
    logger.warn(`Slow query detected: ${sql} (${timing}ms)`);
  }
};

/**
 * Get the shared Sequelize instance with full TypeScript-like suggestions
 * @returns {Sequelize} Configured Sequelize instance
 */
const getConnectionPool = () => {
  if (!connectionPool) {
    // Sequelize client
    connectionPool = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      dialect: "mysql",
      port: 3306,
      pool: {
        max: 5,
        min: 0,
        acquire: 5000,
        idle: 10000, // 10 seconds idle timeout
      },
      dialectOptions: {
        connectTimeout: 5000,
        timezone: "+00:00",
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
      retry: {
        max: 3,
        match: [/ECONNRESET/, /Packets out of order/i, /ETIMEDOUT/],
        backoffBase: 300,
        backoffExponent: 1.3,
      },
      logging: IS_DEV ? console.log : slowQueryLogger,
      benchmark: IS_DEV,
    });
  }
  return connectionPool;
};

const closeConnectionPool = async () => {
  try {
    if (connectionPool) {
      await connectionPool.close();
      logger.info("Connection pool closed");
    }
  } catch (error) {
    logger.error("Failed to close database connection", {
      error: error.message,
      stack: error.stack,
    });
  } finally {
    connectionPool = null;
  }
};

if (IS_DEV) {
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received - closing server");
    await closeConnectionPool();
    process.exit(0);
  });

  process.on("exit", async () => {
    await closeConnectionPool();
  });
}

module.exports = {
  getConnectionPool,
  closeConnectionPool,
  sequelize: getConnectionPool(),
};
