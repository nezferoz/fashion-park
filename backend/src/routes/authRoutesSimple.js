const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerSimple');
const auth = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Forgot password routes
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/forgot-password-token', authController.generateResetToken); // Generate token only
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
