require("dotenv").config({
  path: "../../.env",
});
const { SESClient } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

module.exports = sesClient;
