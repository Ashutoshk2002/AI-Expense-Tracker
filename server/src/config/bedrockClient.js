const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

module.exports = bedrockClient;
