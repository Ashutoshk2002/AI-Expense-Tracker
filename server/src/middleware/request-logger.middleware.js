/* eslint-disable no-unused-vars */
const { logger, LogLevel } = require("../utils/logger");
const onHeaders = require("on-headers");
const onFinished = require("on-finished");

const SLOW_REQUEST_THRESHOLD_MS =
  Number(process.env.SLOW_REQUEST_THRESHOLD_MS) || 1000;
const MAX_QUERY_PARAMS_LOG = Number(process.env.MAX_QUERY_PARAMS_LOG) || 3;
const LOG_BODY_SAMPLE = process.env.LOG_BODY_SAMPLE === "true";
const LOG_HEADERS = process.env.LOG_HEADERS === "true";

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();

  const requestDetails = {
    method: req.method,
    path: req.originalUrl,
    statusCode: null,
    durationMs: null,
    user: req?.user?.user_id || "anonymous",
  };

  req._requestLog = {
    startTime,
    path: req.path,
  };

  if (Object.keys(req.query).length > 0) {
    requestDetails.query = Object.entries(req.query)
      .slice(0, MAX_QUERY_PARAMS_LOG)
      .reduce((obj, [key, val]) => {
        obj[key] = typeof val === "string" ? val.slice(0, 100) : val;
        return obj;
      }, {});
  }

  if (LOG_HEADERS) {
    requestDetails.headers = {
      "user-agent": req.get("user-agent"),
      referer: req.get("referer"),
      ip: req.ip,
    };
  }

  // Sample request body in development only
  if (LOG_BODY_SAMPLE && req.body && JSON.stringify(req.body).length < 10000) {
    try {
      requestDetails.bodySample =
        typeof req.body === "string"
          ? req.body.slice(0, 200)
          : JSON.stringify(req.body).slice(0, 200);
    } catch (e) {
      requestDetails.bodySample = "[unserializable]";
    }
  }

  onHeaders(res, () => {
    requestDetails.statusCode = res.statusCode;
  });

  onFinished(res, () => {
    const durationNs = process.hrtime(startTime);
    const durationMs = durationNs[0] * 1e3 + durationNs[1] / 1e6;
    requestDetails.durationMs = durationMs.toFixed(2);

    // Determine log level
    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.path}`, requestDetails);
    } else if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(`SLOW HTTP ${req.method} ${req.path}`, {
        ...requestDetails,
        stack: new Error().stack.split("\n").slice(1, 4).join("\n"), // Truncated stack
      });
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.path}`, requestDetails);
    } else if (process.env.ENVIRONMENT_MODE === "DEV") {
      logger.info(`HTTP ${req.method} ${req.path}`, requestDetails);
    }
  });

  next();
};

module.exports = requestLogger;
