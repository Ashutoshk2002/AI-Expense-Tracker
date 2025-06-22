const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { S3_BUCKET_NAME } = require("../constants");
const s3 = require("../config/s3Client");

const sanitizeQuery = (query) => {
  if (!query) return "";
  return query
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .join(" ")
    .slice(0, 100);
};

const deleteFileFromS3 = async (key) => {
  if (!key) return;

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  return await s3.send(new DeleteObjectCommand(deleteParams));
};

const deleteS3Objects = async (s3Keys) => {
  if (!s3Keys || s3Keys.length === 0) return;

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: s3Keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  };

  return await s3.send(new DeleteObjectsCommand(deleteParams));
};

module.exports = {
  sanitizeQuery,
  deleteFileFromS3,
  deleteS3Objects,
};
