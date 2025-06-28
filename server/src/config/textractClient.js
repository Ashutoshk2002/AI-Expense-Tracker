const { TextractClient } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

module.exports = textractClient;
