const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes");
const cognitoUserMiddleware = require("./middleware/auth.middleware");
const { notFoundHandler, requestLogger } = require("./middleware");

const app = express();

// API routes configuration
const API_VERSION = process.env.API_VERSION || "v1";
const API_PREFIX = `/api/${API_VERSION}`;

const compressionOptions = {
  level: 6,
  threshold: "1kb",
  filter: (req, res) => {
    if (
      res.getHeader("Content-Type")?.includes("image/") ||
      req.headers["x-no-compression"]
    ) {
      return false;
    }

    return compression.filter(req, res);
  },
};

//middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression(compressionOptions));

// Custom middleware
app.use(cognitoUserMiddleware);
app.use(requestLogger);

app.use(API_PREFIX, routes);

app.use(notFoundHandler);

module.exports = app;
