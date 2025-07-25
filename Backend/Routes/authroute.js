import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, sendOTP, verifyOTP, resendOTP, verifyToken, forgotPasswordSendOTP, resetPasswordWithOTP } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadUserFiles } from '../utils/multerConfig.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working!'
    });
});



// Validation rules for registration
const registerValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),

    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian phone number'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('dateOfBirth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),

    body('age')
        .isInt({ min: 18, max: 100 })
        .withMessage('Age must be between 18 and 100'),

    body('adharNumber')
        .optional()
        .matches(/^\d{12}$/)
        .withMessage('Adhar number must be 12 digits'),

    body('panCardNumber')
        .optional()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .withMessage('Please provide a valid PAN card number'),

    body('pinCode')
        .matches(/^\d{6}$/)
        .withMessage('Pin code must be 6 digits'),

    body('state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State is required'),

    body('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City is required'),

    body('address')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Address must be between 10 and 500 characters'),

    body('dealerCode')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Dealer code is required'),

    body('role')
        .optional()
        .isIn(['Electrician', 'Distributor'])
        .withMessage('Role must be either Electrician or Distributor')
];

const loginValidation = [
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit phone number'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// OTP validation rules
const otpValidation = [
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit phone number')
];

const verifyOtpValidation = [
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit phone number'),

    body('otp')
        .matches(/^\d{6}$/)
        .withMessage('OTP must be 6 digits')
];

// Forgot password validation rules
const forgotPasswordValidation = [
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit phone number')
];

const resetPasswordValidation = [
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit phone number'),

    body('otp')
        .matches(/^\d{6}$/)
        .withMessage('OTP must be 6 digits'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', otpValidation, sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for phone number
// @access  Public
router.post('/verify-otp', verifyOtpValidation, verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to phone number
// @access  Public
router.post('/resend-otp', otpValidation, resendOTP);

// @route   POST /api/auth/register
// @desc    Register a new user with file uploads
// @access  Public
router.post('/register', uploadUserFiles, registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user with phone number
// @access  Public
router.post('/login', loginValidation, login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token and return user data
// @access  Private
router.get('/verify-token', authenticateToken, verifyToken);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, forgotPasswordSendOTP);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP verification
// @access  Public
router.post('/reset-password', resetPasswordValidation, resetPasswordWithOTP);

export default router;