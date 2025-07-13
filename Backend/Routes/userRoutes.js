import express from 'express';
import { body } from 'express-validator';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import {
    authenticateToken, 
    requireAdmin,
    requireOwnershipOrAdmin
} from '../middleware/auth.js';

const router = express.Router();

// Validation rules for user update
const updateUserValidation = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),

    body('phoneNumber')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian phone number'),

    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),

    body('age')
        .optional()
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
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Pin code must be 6 digits'),

    body('state')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters'),

    body('city')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),

    body('address')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Address must be between 10 and 500 characters'),

    body('dealerCode')
        .optional()
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('Dealer code must be between 2 and 20 characters'),

    body('role')
        .optional()
        .isIn(['Electrician', 'Distributor', 'admin'])
        .withMessage('Role must be Electrician, Distributor, or admin')
];

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Private (Admin only)
router.get('/', authenticateToken, requireAdmin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private (Own profile or Admin)
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user details
// @access  Private (Own profile or Admin)
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, updateUserValidation, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Own profile or Admin)
router.delete('/:id', authenticateToken, requireOwnershipOrAdmin, deleteUser);

export default router;