// backend/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

// Signup: email & password
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  AuthController.signup
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

module.exports = router;
