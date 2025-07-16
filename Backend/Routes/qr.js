// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const QRCode = require('../models/QRCode');
// const auth = require('../middleware/auth');

// // Process QR Code scan
// router.post('/process', auth, async (req, res) => {
//   try {
//     const { qrData } = req.body;
//     const userId = req.user.id;

//     // Find QR code in database
//     const qrCode = await QRCode.findOne({ code: qrData, isActive: true });
    
//     if (!qrCode) {
//       return res.status(404).json({
//         success: false,
//         message: 'Invalid or expired QR code'
//       });
//     }

//     // Check if user already scanned this QR code
//     const user = await User.findById(userId);
//     if (user.scannedQRCodes.includes(qrCode._id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'QR code already scanned'
//       });
//     }

//     // Add points to user
//     user.monthlyPoints += qrCode.points;
//     user.yearlyPoints += qrCode.points;
//     user.scannedQRCodes.push(qrCode._id);
    
//     await user.save();

//     // Mark QR code as used (optional)
//     qrCode.usedBy = userId;
//     qrCode.usedAt = new Date();
//     await qrCode.save();

//     res.json({
//       success: true,
//       message: `Successfully added ${qrCode.points} points!`,
//       pointsAdded: qrCode.points,
//       totalMonthlyPoints: user.monthlyPoints,
//       totalYearlyPoints: user.yearlyPoints
//     });

//   } catch (error) {
//     console.error('QR processing error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while processing QR code'
//     });
//   }
// });

// module.exports = router;