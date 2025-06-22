/* eslint-disable no-console */
const { handler } = require("./index");

const event = {
  path: "/api/v1/health",
  httpMethod: "GET",
  headers: {},
  body: null,
  queryStringParameters: {},
};

const context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: "local-test",
  awsRequestId: "test-request-id",
};

(async () => {
  try {
    const result = await handler(event, context);
    console.log("Lambda result:", result);
  } catch (error) {
    console.error("Lambda error:", error);
  }
})();
