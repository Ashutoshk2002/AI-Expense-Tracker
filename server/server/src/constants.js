// Environment variables
const ENVIRONMENT_MODE = process.env.ENVIRONMENT_MODE;
const PORT = process.env.PORT;

// AWS RDS
const AWS_REGION = process.env.AWS_REGION;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

// Cognito
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_VENDOR_POOL_ID = process.env.COGNITO_VENDOR_POOL_ID;

// AWS S3
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// CloudFront
const CLOUDFRONT_DISTRIBUTION_URL = process.env.CLOUDFRONT_DISTRIBUTION_URL;

// FE URL
const FRONTEND_URL = process.env.FRONTEND_URL;

// SES SENDER EMAIL
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL;

const SES_RATE_LIMIT = 14;

module.exports = {
  PORT,
  COGNITO_USER_POOL_ID,
  COGNITO_VENDOR_POOL_ID,
  AWS_REGION,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  S3_BUCKET_NAME,
  ENVIRONMENT_MODE,
  CLOUDFRONT_DISTRIBUTION_URL,
  SES_RATE_LIMIT,
  FRONTEND_URL,
  SES_SENDER_EMAIL,
};
