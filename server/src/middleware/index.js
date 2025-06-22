module.exports = {
  notFoundHandler: require("./not-found.middleware"),
  cognitoUserMiddleware: require("./auth.middleware"),
  requestLogger: require("./request-logger.middleware"),
  uploadMedia: require("./upload.middleware"),
  validateRequest: require("./validation.middleware"),
};
