import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../Models/user.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            fullName,
            phoneNumber,
            password,
            dateOfBirth,
            age,
            adharNumber,
            panCardNumber,
            pinCode,
            state,
            city,
            address,
            dealerCode,
            role
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this phone number'
            });
        }

        // Check if required profile photo is uploaded
        if (!req.files || !req.files.profilePhoto) {
            return res.status(400).json({
                success: false,
                message: 'Profile photo is required'
            });
        }

        // Prepare user data
        const userData = {
            fullName,
            phoneNumber,
            password,
            dateOfBirth: new Date(dateOfBirth),
            age: parseInt(age),
            pinCode,
            state,
            city,
            address,
            dealerCode,
            profilePhoto: req.files.profilePhoto[0].path,
            role: role || 'Electrician'
        };

        // Add optional fields if provided
        if (adharNumber) userData.adharNumber = adharNumber;
        if (panCardNumber) userData.panCardNumber = panCardNumber;

        // Add optional file uploads
        if (req.files.adharCard) userData.adharCard = req.files.adharCard[0].path;
        if (req.files.panCard) userData.panCard = req.files.panCard[0].path;
        if (req.files.bankDetails) userData.bankDetails = req.files.bankDetails[0].path;

        // Create new user
        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    status: user.status,
                    isVerified: user.isVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { phoneNumber, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ phoneNumber }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    status: user.status,
                    isVerified: user.isVerified,
                    dealerCode: user.dealerCode,
                    address: user.address,
                    age: user.age,
                    dateOfBirth: user.dateOfBirth,
                    pinCode: user.pinCode,
                    state: user.state,
                    city: user.city,
                    adharNumber: user.adharNumber,
                    panCardNumber: user.panCardNumber,
                    profilePhoto: user.profilePhoto,
                    adharCard: user.adharCard,
                    panCard: user.panCard,
                    bankDetails: user.bankDetails,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // Since we're using stateless JWT tokens, logout is handled on the client side
        // by removing the token from storage. We can optionally implement token blacklisting
        // here if needed for enhanced security.

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};