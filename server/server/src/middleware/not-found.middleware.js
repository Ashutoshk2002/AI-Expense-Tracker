// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    url: req.originalUrl,
    status: "error",
    message: "The requested resource was not found on this server.",
  });
};

module.exports = notFoundHandler;
