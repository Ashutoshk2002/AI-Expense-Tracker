const jwt = require("jsonwebtoken");
const { JWT_SECRET, ENVIRONMENT_MODE } = require("../constants");

const verifyToken = (req, res, next) => {
  if (ENVIRONMENT_MODE === "DEV") {
    req.user = { user_id: "5d4eda7e-a244-47f9-a330-6892dd9f196f" };
    return next();
  }
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
