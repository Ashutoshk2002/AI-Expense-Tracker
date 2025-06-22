require("dotenv").config();
const { getConnectionPool, closeConnectionPool } = require("./db");
const { logger } = require("./utils/logger");

const serverless = require("serverless-http");

const app = require("./app");

// Constants
const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.ENVIRONMENT_MODE === "DEV";

let serverlessHandler;

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sequelize = getConnectionPool();

  if (!serverlessHandler) {
    serverlessHandler = serverless(app, { provider: "aws" });
  }
  try {
    await sequelize.authenticate();

    return await serverlessHandler(event, context);
  } catch (error) {
    logger.error("Handler execution failed", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      awsRequestId: context.awsRequestId,
    });
    throw error;
  }
};

if (IS_DEV) {
  (async () => {
    try {
      const sequelize = getConnectionPool();
      await sequelize.authenticate();
      // Uncomment if you need database synchronization
      // await sequelize.sync({ alter: true });
      // logger.info("Database models synchronized.");
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    } catch (error) {
      logger.error("Dev server failed", {
        error: error.message,
        stack: error.stack,
      });
      await closeConnectionPool();
      process.exit(1);
    }
  })();
}

module.exports.handler = handler;
