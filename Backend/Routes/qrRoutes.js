import express from 'express';

const router = express.Router();

// Simple test route first
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'QR routes working'
  });
});

// Process QR Code scan
router.post('/process', async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // For now, let's simulate the QR processing
    // You can add database logic later
    const mockQRData = {
      'FASP1045TR2': { points: 100 },
      'FASP2046TR3': { points: 50 },
      'FASP3047TR4': { points: 200 }
    };

    const qrInfo = mockQRData[qrData];
    
    if (!qrInfo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully added ${qrInfo.points} points!`,
      data: {
        pointsAdded: qrInfo.points,
        qrCode: qrData
      }
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

