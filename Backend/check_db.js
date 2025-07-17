import mongoose from 'mongoose';
import User from './Models/user.js';

const connectAndCheck = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb+srv://ankitgangrade9617:fastagcab@cluster0.qxuyfra.mongodb.net/electrician-app');
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // List all databases
    console.log('\n🗄️ Listing all databases...');
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));

    // Check if there are users in other collections
    console.log('\n📁 Checking collections in current database...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(col => col.name));

    // Check existing users
    console.log('\n🔍 Checking existing users...');
    const users = await User.find({}, 'phoneNumber adharNumber panCardNumber dealerCode');
    console.log('Existing users count:', users.length);
    console.log('Existing users:', JSON.stringify(users, null, 2));

    // Check indexes
    console.log('\n📋 Checking database indexes...');
    const indexes = await User.collection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Test the specific user data from the request
    console.log('\n🧪 Testing duplicate check for new user...');
    const testPhoneNumber = '8959305282';
    const testAdharNumber = '123456789012';
    const testPanCardNumber = 'ABCDE1234F';
    const testDealerCode = 'DLR001';

    const existingByPhone = await User.findOne({ phoneNumber: testPhoneNumber });
    const existingByAdhar = await User.findOne({ adharNumber: testAdharNumber });
    const existingByPan = await User.findOne({ panCardNumber: testPanCardNumber });
    const existingByDealer = await User.findOne({ dealerCode: testDealerCode });

    console.log('Existing user with phone', testPhoneNumber, ':', existingByPhone ? 'FOUND' : 'NOT FOUND');
    console.log('Existing user with adhar', testAdharNumber, ':', existingByAdhar ? 'FOUND' : 'NOT FOUND');
    console.log('Existing user with PAN', testPanCardNumber, ':', existingByPan ? 'FOUND' : 'NOT FOUND');
    console.log('Existing user with dealer code', testDealerCode, ':', existingByDealer ? 'FOUND' : 'NOT FOUND');

    if (existingByAdhar) {
      console.log('Conflicting adhar user:', JSON.stringify(existingByAdhar, null, 2));
    }
    if (existingByPan) {
      console.log('Conflicting PAN user:', JSON.stringify(existingByPan, null, 2));
    }
    if (existingByDealer) {
      console.log('Conflicting dealer code user:', JSON.stringify(existingByDealer, null, 2));
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

connectAndCheck();
