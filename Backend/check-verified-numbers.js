import twilio from 'twilio';

// Twilio configuration
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// Initialize Twilio client
const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

// Check verified phone numbers
const checkVerifiedNumbers = async () => {
  try {
    console.log('🔍 Checking verified phone numbers in Twilio account...');
    console.log('================================================');
    
    // Try to get verified phone numbers using the correct API
    try {
      const verifiedNumbers = await client.validationRequests.list();

      if (verifiedNumbers.length === 0) {
        console.log('❌ No verified phone numbers found in trial account');
      } else {
        console.log('✅ Found verified phone numbers:');
        console.log('');

        verifiedNumbers.forEach((number, index) => {
          console.log(`${index + 1}. Phone Number: ${number.phoneNumber}`);
          console.log(`   Status: ${number.validationCode ? 'Verified' : 'Pending'}`);
          console.log(`   Date Created: ${number.dateCreated}`);
          console.log('');
        });
      }
    } catch (apiError) {
      console.log('❌ Could not fetch validation requests (API method may not be available)');
      console.log('This is normal for trial accounts.');
    }

    console.log('');
    console.log('📝 To verify a phone number:');
    console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    console.log('2. Click "Add a new number"');
    console.log('3. Enter the phone number you want to verify');
    console.log('4. Complete the verification process');
    
    // Also check outgoing caller IDs (another way numbers get verified)
    console.log('🔍 Checking outgoing caller IDs...');
    console.log('==================================');
    
    const callerIds = await client.outgoingCallerIds.list();
    
    if (callerIds.length === 0) {
      console.log('❌ No verified caller IDs found');
    } else {
      console.log('✅ Found verified caller IDs:');
      console.log('');
      
      callerIds.forEach((callerId, index) => {
        console.log(`${index + 1}. Phone Number: ${callerId.phoneNumber}`);
        console.log(`   Friendly Name: ${callerId.friendlyName}`);
        console.log(`   Date Created: ${callerId.dateCreated}`);
        console.log('');
      });
    }
    
    // Check account type and limits
    console.log('🔍 Account Information:');
    console.log('======================');
    
    const account = await client.api.accounts(TWILIO_CONFIG.accountSid).fetch();
    console.log(`Account Type: ${account.type}`);
    console.log(`Account Status: ${account.status}`);
    
    if (account.type === 'Trial') {
      console.log('');
      console.log('⚠️  TRIAL ACCOUNT LIMITATIONS:');
      console.log('- Can only send SMS to verified phone numbers');
      console.log('- All SMS messages will be prefixed with "Sent from your Twilio trial account"');
      console.log('- Limited to sending messages to numbers you have verified');
      console.log('');
      console.log('💡 To remove limitations:');
      console.log('- Upgrade to a paid account at: https://console.twilio.com/billing');
    }
    
  } catch (error) {
    console.error('❌ Error checking verified numbers:', error.message);
    console.error('Error details:', error);
  }
};

// Run the check
checkVerifiedNumbers().catch(console.error);
