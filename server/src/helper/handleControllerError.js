const { logError } = require("./loggerHelper");

const handleControllerError = (res, error, operation) => {
  logError(`Error while ${operation}:`, error);
  return res.status(error.statusCode || 500).json({
    message: error?.message || `Error during ${operation}`,
    error: error,
  });
};

module.exports = {
  handleControllerError,
};
