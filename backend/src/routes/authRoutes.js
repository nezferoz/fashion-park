const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Email verification
router.get('/verify-email', authController.verifyEmail);

// Request password reset
router.post('/forgot-password', authController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

// Check verification status
router.get('/check-verification', authController.checkVerificationStatus);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

module.exports = router; 