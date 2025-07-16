import express from 'express';
import QRCode from '../Models/QRCode.js';
import User from '../Models/user.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Simple test route first
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'QR routes working'
  });
});

// Process QR Code scan with authentication
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    const userId = req.user._id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Step 1: Check if the scanned QR code exists in the MongoDB collection `qrcodes`
    const qrCode = await QRCode.findOne({ qrCode: qrData });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR Code or Already Redeemed'
      });
    }

    // Step 2: Check if the status is "Not Redeem"
    if (qrCode.status !== 'Not Redeem') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR Code or Already Redeemed'
      });
    }

    // Step 3a: Send a PATCH request to update the QR code document
    qrCode.status = 'Redeemed';
    qrCode.redeemedBy = userId;
    qrCode.redeemedAt = new Date();
    await qrCode.save();

    // Step 3b: Add the points to the currently logged-in user's monthlyPoints and yearlyPoints
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.monthlyPoints = (user.monthlyPoints || 0) + qrCode.points;
    user.yearlyPoints = (user.yearlyPoints || 0) + qrCode.points;

    // Step 3c: Save the updated values to the user document
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ${qrCode.points} points!`,
      data: {
        pointsAdded: qrCode.points,
        qrCode: qrData,
        totalMonthlyPoints: user.monthlyPoints,
        totalYearlyPoints: user.yearlyPoints
      },
      totalMonthlyPoints: user.monthlyPoints,
      totalYearlyPoints: user.yearlyPoints
    });

  } catch (error) {
    console.error('QR processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing QR code'
    });
  }
});

export default router;

