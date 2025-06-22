require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const DIALECT = "mysql";

const DB_USERNAME = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: DIALECT,
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST || "127.0.0.1",
    dialect: DIALECT,
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: DIALECT,
  },
};
