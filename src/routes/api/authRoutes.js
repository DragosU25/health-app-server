const express = require('express');
const {
  login,
  logout,
  register,
  verifyUserEmail,
  getCurrentUser,
  handleResendVerificationEmail,
} = require('../../controllers/authControllers');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/auth/verify/:verificationToken', verifyUserEmail);

// POST /users/verify - Resend verification email
router.post('/auth/resend-verification', handleResendVerificationEmail);

router.post('/auth/logout', authMiddleware, logout);

router.get('/auth/current', authMiddleware, getCurrentUser);

module.exports = router;
