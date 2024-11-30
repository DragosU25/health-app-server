/* eslint-disable no-undef */
const User = require('../models/userSchema.js');

const jwt = require('jsonwebtoken');

require('dotenv').config();

const secret = process.env.JWT_SECRET;

const sendVerificationEmail = require('../utils/emailService');

const registerUser = async (username, email, password) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error('Email in use');
  }

  console.log('Generating verification token...');
  const verificationToken = await sendVerificationEmail(email);
  console.log('Generated token:', verificationToken);

  const user = new User({
    username,
    email,
    password,
    verificationToken,
  });
  user.setPassword(password);

  const payload = { email: email };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  user.token = token;

  await user.save();
  return user;
};

// Login
const userLogin = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user || !user.validPassword(password)) {
    throw new Error('Email or password is wrong');
  }

  if (!user.verify) {
    throw new Error('Verify your email to confirm registration...!');
  }

  const payload = { id: user._id, name: user.username, email: user.email };

  const token = jwt.sign(payload, secret, {
    expiresIn: '1h',
  });

  user.token = token;
  await user.save();

  return { token, user };
};

// Get user by ID
const getUserById = async (userId) => {
  return await User.findById(userId);
};

// Logout user
const userLogout = async (userId) => {
  const loggedOutUser = await User.findByIdAndUpdate(
    userId,
    { $set: { token: null } }, // Set the token field to null
    { new: true }
  );

  return loggedOutUser;
};

const verifyUserEmail = async (verificationToken) => {
  const updates = {
    verify: true,
    verificationToken: null,
  };

  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new Error('Invalid or expired verification token.');
    }

    if (user.verify) {
      throw new Error('Verification has already been passed');
    }

    const updatedUser = await User.findOneAndUpdate(
      { verificationToken },
      { $set: updates },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error verifying user email:', error.message);
    throw error;
  }
};

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.verify) {
    throw new Error('Verification has already been passed');
  }

  try {
    const verificationToken = await sendVerificationEmail(user.email);
    user.verificationToken = verificationToken;

    await user.save();
  } catch (error) {
    throw new Error(
      `Failed to send verification email. Error: ${error.message}`
    );
  }

  return { message: 'Verification email sent' };
};

module.exports = {
  registerUser,
  userLogin,
  getUserById,
  userLogout,
  verifyUserEmail,
  resendVerificationEmail,
};
