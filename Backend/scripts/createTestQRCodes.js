// Script to create test QR codes for testing the QR Code Redeem Automation
import mongoose from 'mongoose';
import QRCode from '../Models/QRCode.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const createTestQRCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test QR codes to create
    const testQRCodes = [
      {
        qrCode: 'FASP1045TR2',
        points: 100,
        status: 'Not Redeem'
      },
      {
        qrCode: 'FASP2046TR3',
        points: 50,
        status: 'Not Redeem'
      },
      {
        qrCode: 'FASP3047TR4',
        points: 200,
        status: 'Not Redeem'
      },
      {
        qrCode: 'FASP4048TR5',
        points: 75,
        status: 'Not Redeem'
      },
      {
        qrCode: 'FASP5049TR6',
        points: 150,
        status: 'Not Redeem'
      }
    ];

    // Create QR codes
    for (const qrData of testQRCodes) {
      try {
        // Check if QR code already exists
        const existingQR = await QRCode.findOne({ qrCode: qrData.qrCode });
        
        if (existingQR) {
          console.log(`⚠️  QR Code ${qrData.qrCode} already exists`);
          continue;
        }

        // Create new QR code
        const newQRCode = new QRCode(qrData);
        await newQRCode.save();
        console.log(`✅ Created QR Code: ${qrData.qrCode} with ${qrData.points} points`);
      } catch (error) {
        console.error(`❌ Error creating QR Code ${qrData.qrCode}:`, error.message);
      }
    }

    console.log('\n🎉 Test QR codes creation completed!');
    console.log('\n📱 You can now test with these QR codes:');
    testQRCodes.forEach(qr => {
      console.log(`   ${qr.qrCode} → ${qr.points} points`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
createTestQRCodes();
