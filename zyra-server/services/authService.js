const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user.
 */
exports.register = async ({ name, email, password, role, department }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

  const user = await User.create({ name, email, password, role, department });
  const token = generateToken(user);
  return { user, token };
};

/**
 * Login with email and password.
 */
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};

/**
 * Get current user profile.
 */
exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};
