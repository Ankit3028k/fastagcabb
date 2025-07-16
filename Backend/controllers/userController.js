import { validationResult } from 'express-validator';
import User from '../Models/user.js';
import { getFileUrl } from '../utils/fileHelper.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Own profile or Admin)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Get user by ID error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Own profile or Admin)
export const updateUser = async (req, res) => {
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

        const { id } = req.params;
        const {
            fullName,
            phoneNumber,
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

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if phone number is being changed and if it's already taken
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
            const existingUser = await User.findOne({ phoneNumber });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
        }

        // Only admin can change roles
        if (role && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can change user roles'
            });
        }

        // Prepare update data
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (age) updateData.age = parseInt(age);
        if (adharNumber) updateData.adharNumber = adharNumber;
        if (panCardNumber) updateData.panCardNumber = panCardNumber;
        if (pinCode) updateData.pinCode = pinCode;
        if (state) updateData.state = state;
        if (city) updateData.city = city;
        if (address) updateData.address = address;
        if (dealerCode) updateData.dealerCode = dealerCode;
        if (role) updateData.role = role;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update user error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating user'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Own profile or Admin)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent users from deleting admin accounts (unless they are admin themselves)
        if (user.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin user'
            });
        }

        // Delete user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while deleting user'
        });
    }
};

// @desc    Update user points
// @route   PUT /api/users/:id/points
// @access  Private (Own profile or Admin)
export const updateUserPoints = async (req, res) => {
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

        const { id } = req.params;
        const { monthlyPoints, yearlyPoints } = req.body;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare update data
        const updateData = {};
        if (monthlyPoints !== undefined) updateData.monthlyPoints = monthlyPoints;
        if (yearlyPoints !== undefined) updateData.yearlyPoints = yearlyPoints;

        // Update user points
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'User points updated successfully',
            data: {
                user: updatedUser,
                monthlyPoints: updatedUser.monthlyPoints,
                yearlyPoints: updatedUser.yearlyPoints
            }
        });

    } catch (error) {
        console.error('Update user points error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating user points'
        });
    }
};

// @desc    Process recharge request
// @route   POST /api/users/recharge
// @access  Private
export const processRecharge = async (req, res) => {
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

        const userId = req.user._id;
        const { mobileNumber, operator, pointsToDeduct } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has sufficient points
        if (user.monthlyPoints < pointsToDeduct) {
            return res.status(400).json({
                success: false,
                message: `Insufficient points. You have ${user.monthlyPoints} points but need ${pointsToDeduct} points.`
            });
        }

        // Deduct points from user
        user.monthlyPoints -= pointsToDeduct;
        await user.save();

        // Here you would typically integrate with a real recharge API
        // For now, we'll just simulate the recharge process

        // Create a recharge record (you might want to create a Recharge model for this)
        const rechargeData = {
            userId: userId,
            mobileNumber: mobileNumber,
            operator: operator,
            pointsDeducted: pointsToDeduct,
            status: 'pending',
            requestedAt: new Date()
        };

        // Log the recharge request
        console.log('Recharge request processed:', rechargeData);

        res.status(200).json({
            success: true,
            message: `Recharge request submitted successfully! ${pointsToDeduct} points deducted.`,
            data: {
                recharge: rechargeData,
                remainingPoints: user.monthlyPoints,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    monthlyPoints: user.monthlyPoints,
                    yearlyPoints: user.yearlyPoints
                }
            }
        });

    } catch (error) {
        console.error('Process recharge error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while processing recharge'
        });
    }
};