const { logger } = require("../utils/logger");
const { ENVIRONMENT_MODE } = require("../constants");

async function cognitoUserMiddleware(req, res, next) {
  try {
    // For Lambda (API Gateway) context
    if (req.apiGateway && req.apiGateway.event) {
      const claims = req.apiGateway.event.requestContext?.authorizer?.claims;

      if (claims) {
        const baseInfo = {
          id: claims.sub,
          email: claims.email,
        };

        req.user = baseInfo;
        return next();
      }
    }

    // For local development
    if (ENVIRONMENT_MODE === "DEV") {
      req.user = {
        id: "31032d3a-c0a1-700b-42d6-aa330c3d2b33",
        email: "ashutosh@test.in",
      };

      return next();
    }

    req.user = null;
    return next();
  } catch (error) {
    logger.error("Error in cognitoUserMiddleware:", error);
    next(error);
  }
}

module.exports = cognitoUserMiddleware;
