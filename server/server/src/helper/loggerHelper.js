const { logger } = require("../utils/logger");

const logError = (message, errorDetails) => {
  logger.error(message, {
    name: errorDetails?.name,
    message: errorDetails?.message,
    stack: errorDetails?.stack,
  });
};

module.exports = { logError };
