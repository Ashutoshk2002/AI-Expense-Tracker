module.exports = {
  notFoundHandler: require("./not-found.middleware"),
  verifyToken: require("./auth.middleware"),
  requestLogger: require("./request-logger.middleware"),
  uploadMedia: require("./upload.middleware"),
  validateRequest: require("./validation.middleware"),
};
