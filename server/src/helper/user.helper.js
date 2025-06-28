const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants");

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hash) => {
  return await bcrypt.compare(plainPassword, hash);
};

const generateToken = (user) => {
  return jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = { hashPassword, comparePassword, generateToken };
