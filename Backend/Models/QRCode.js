// QRCode.js (ESM compatible) - Updated for QR Code Redeem Automation
import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  qrCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Not Redeem', 'Redeemed'],
    default: 'Not Redeem'
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redeemedAt: {
    type: Date
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const QRCode = mongoose.model('QRCode', qrCodeSchema);

export default QRCode;
