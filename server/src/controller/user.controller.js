const { User } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");
const { sequelize } = require("../db");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../helper/user.helper");

// Utility function to find user by ID
const findUserById = async (user_id) => {
  if (!user_id) {
    throw new ApiError(400, "User ID is required");
  }
  const user = await User.findByPk(user_id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

// Utility function to register user and create related data
const registerUser = async (userData, req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      throw new ApiError(409, "User with this email already exists");

    const hashed = await hashPassword(password);

    const newUser = await User.create(
      { name, email, phone, password: hashed },
      { transaction }
    );

    await transaction.commit();
    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User registered successfully!"));
  } catch (error) {
    await transaction.rollback();
    handleControllerError(res, error, "registering user");
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(401, "Invalid email or password");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const token = generateToken(user);

    return res
      .status(200)
      .json(new ApiResponse(200, { user, token }, "Login successful"));
  } catch (err) {
    handleControllerError(res, err, "logging in");
  }
};

// Register Function
const registerController = async (req, res) => {
  const userData = matchedData(req);
  await registerUser(userData, req, res);
};

// Get User by ID controller
const getUserByIdController = async (req, res) => {
  try {
    const user = await findUserById(req.params.user_id);
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User found successfully!"));
  } catch (error) {
    handleControllerError(res, error, "fetching user");
  }
};

// Update User controller
const updateUserController = async (req, res) => {
  try {
    const user = await findUserById(req.params.user_id);
    const userData = matchedData(req);

    await user.update(userData);
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully!"));
  } catch (error) {
    handleControllerError(res, error, "updating user");
  }
};

// Delete User controller
const deleteUserController = async (req, res) => {
  try {
    const user = await findUserById(req.params.user_id);
    await user.destroy();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully!"));
  } catch (error) {
    handleControllerError(res, error, "deleting user");
  }
};

module.exports = {
  registerController,
  loginController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
};
