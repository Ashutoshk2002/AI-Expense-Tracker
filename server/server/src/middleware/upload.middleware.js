const multer = require("multer");
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and PDF files are allowed."),
        false
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
    files: 1,
  },
});

module.exports = upload;
