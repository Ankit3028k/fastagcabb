import twilio from 'twilio';
import asyncRetry from 'async-retry';

// Twilio configuration with environment variables
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// Validate required environment variables
if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken || !TWILIO_CONFIG.phoneNumber) {
  console.error('❌ Missing required Twilio environment variables. Please check your .env file.');
  console.error('Required variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
}

// Initialize Twilio client
const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

/**
 * Send SMS using Twilio with retry mechanism
 * @param {string} phoneNumber - Target phone number
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - Result object with success status and details
 */
export const sendSMSViaTwilio = async (phoneNumber, message) => {
  try {
    console.log('📱 Twilio SMS: Starting SMS send to:', phoneNumber);
    
    // Format phone number (ensure it has +91 country code for India)
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    console.log('📞 Twilio SMS: Formatted phone:', formattedPhone);
    console.log('💬 Twilio SMS: Message:', message);
    
    // Send SMS with retry mechanism
    const twilioMessage = await asyncRetry(
      async () => {
        console.log('📤 Twilio SMS: Attempting to send message...');
        
        const result = await client.messages.create({
          body: message,
          from: TWILIO_CONFIG.phoneNumber,
          to: formattedPhone
        });
        
        console.log('✅ Twilio SMS: Message sent successfully');
        console.log('📋 Twilio SMS: Message SID:', result.sid);
        console.log('📊 Twilio SMS: Status:', result.status);
        
        return result;
      },
      { 
        retries: 3, 
        minTimeout: 1000, 
        factor: 2,
        onRetry: (error, attempt) => {
          console.log(`🔄 Twilio SMS: Retry attempt ${attempt} due to:`, error.message);
        }
      }
    );
    
    return {
      success: true,
      message: 'SMS sent successfully via Twilio',
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      to: twilioMessage.to,
      from: twilioMessage.from,
      dateCreated: twilioMessage.dateCreated
    };
    
  } catch (error) {
    console.error('❌ Twilio SMS Error:');
    console.error('   - Error code:', error.code);
    console.error('   - Error message:', error.message);
    console.error('   - Status:', error.status);
    console.error('   - More info:', error.moreInfo);
    
    // Handle specific Twilio error codes
    let userMessage = 'Failed to send SMS. Please try again.';
    
    switch (error.code) {
      case 21608:
        userMessage = 'Phone number needs to be verified for trial account. Please contact support.';
        break;
      case 21614:
        userMessage = 'Invalid phone number format. Please check the number and try again.';
        break;
      case 21211:
        userMessage = 'Invalid phone number. Please check the number and try again.';
        break;
      case 30001:
        userMessage = 'Message queue is full. Please try again in a few minutes.';
        break;
      case 30002:
        userMessage = 'Account suspended. Please contact support.';
        break;
      case 30003:
        userMessage = 'Unreachable destination. Please check the phone number.';
        break;
      case 30004:
        userMessage = 'Message blocked by carrier. Please try again later.';
        break;
      case 30005:
        userMessage = 'Unknown destination. Please check the phone number.';
        break;
      case 30006:
        userMessage = 'Landline or unreachable carrier. Please use a mobile number.';
        break;
      default:
        if (error.message) {
          userMessage = `SMS service error: ${error.message}`;
        }
    }
    
    return {
      success: false,
      message: userMessage,
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
        moreInfo: error.moreInfo
      }
    };
  }
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid format
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Basic validation for Indian phone numbers
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
  
  return indianPhoneRegex.test(cleanNumber);
};

export default {
  sendSMSViaTwilio,
  validatePhoneNumber
};
