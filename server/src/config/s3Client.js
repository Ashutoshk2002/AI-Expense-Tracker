require("dotenv").config({
  path: "../../.env",
});
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

module.exports = s3;
