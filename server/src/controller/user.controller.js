const { User } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");
const { sequelize } = require("../db");

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
    const [newUser, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: userData,
      transaction,
    });

    if (!created) {
      throw new ApiError(409, "User with this email already exists");
    }

    await transaction.commit();
    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User registered successfully!"));
  } catch (error) {
    await transaction.rollback();
    handleControllerError(res, error, "registering user");
  }
};

// Register Function
const registerController = async (req, res) => {
  const userData = matchedData(req);
  await registerUser(userData, req, res);
};

// Register Function for OAuth
const oauthRegisterController = async (req, res) => {
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
  oauthRegisterController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
};
