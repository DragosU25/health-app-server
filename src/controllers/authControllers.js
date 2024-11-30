const {
  registerUser,
  getUserById,
  userLogin,
  userLogout,
  verifyUserEmail,
  resendVerificationEmail,
} = require('../services/authServices');

const { extractUserId } = require('../middlewares/extractUserId');
const Joi = require('joi');

const handleError = (res, error, next) => {
  res.status(500).json({ message: error.message });
  next(error);
};

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const newUser = await registerUser(username, email, password);
    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        verificationToken: newUser.verificationToken,
      },
    });
  } catch (error) {
    handleError(res, error, next);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userLogin(email, password);
    res.status(200).json({
      token: user.token,
      user: {
        id: user.user._id,
        name: user.user.username,
        email: user.user.email,
        verify: user.user.verify,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Missing Authorization header' });
  }

  try {
    const userId = extractUserId(authHeader);
    const result = await userLogout(userId);
    result
      ? res.status(204).json({ message: 'Logged out' })
      : res.status(500).json({ message: 'Logout failed' });
  } catch (error) {
    handleError(res, error, next);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Missing Authorization header' });
  }

  try {
    const userId = extractUserId(authHeader);
    const result = await getUserById(userId);

    if (!result) {
      return res
        .status(404)
        .json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      data: { ...result._doc },
    });
  } catch (error) {
    handleError(res, error, next);
  }
};

exports.verifyUserEmail = async (req, res) => {
  const { verificationToken } = req.params;
  try {
    await verifyUserEmail(verificationToken);
    res.status(200).json({ message: 'User successfully verified', code: 200 });
  } catch (error) {
    res
      .status(404)
      .json({ message: 'Error verifying user', error: error.message });
  }
};

exports.handleResendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const emailSchema = Joi.object({ email: Joi.string().email().required() });
  const { error } = emailSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const response = await resendVerificationEmail(email);
    res.status(200).json(response);
  } catch (error) {
    const statusCode =
      error.message === 'User not found' ||
      error.message === 'Verification has already been passed'
        ? 400
        : 500;
    res.status(statusCode).json({ message: error.message });
  }
};
