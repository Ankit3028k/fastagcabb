import AsyncStorage from '@react-native-async-storage/async-storage';

interface InteraktSMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

class InteraktSMSService {
  // Interakt API configuration
  private baseURL = 'https://api.interakt.ai';
  private apiKey = 'YOUR_INTERAKT_API_KEY'; // Replace with actual API key from Interakt dashboard
  private templateId = 'otp_verification'; // Replace with your actual template name

  // Generate random OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP for verification
  private async storeOTP(phoneNumber: string, otp: string): Promise<void> {
    const otpData = {
      otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    await AsyncStorage.setItem(`interakt_otp_${phoneNumber}`, JSON.stringify(otpData));
    console.log('🔢 Interakt Service: OTP stored for verification:', otp);
  }

  // Send SMS using Interakt API
  async sendOTP(phoneNumber: string): Promise<InteraktSMSResponse> {
    try {
      console.log('📱 Interakt Service: Starting OTP send for:', phoneNumber);

      // Generate OTP
      const otp = this.generateOTP();
      console.log('🔢 Interakt Service: Generated OTP:', otp);

      // Format phone number (Interakt expects format without +)
      const formattedPhone = phoneNumber.replace(/^\+/, '');
      console.log('📞 Interakt Service: Formatted phone:', formattedPhone);

      // Prepare message data for Interakt
      const messageData = {
        countryCode: "+91",
        phoneNumber: formattedPhone,
        type: "Template",
        template: {
          name: "otp_verification", // Replace with your template name
          languageCode: "en",
          headerValues: [],
          bodyValues: [otp, "15"], // OTP and expiry time
          buttonValues: []
        }
      };

      console.log('🌐 Interakt Service: Making API request');
      console.log('📤 Interakt Service: Request data:', JSON.stringify(messageData, null, 2));

      const response = await fetch(`${this.baseURL}/v1/public/message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      console.log('📡 Interakt Service: Response received, status:', response.status);

      const responseData = await response.json();
      console.log('📥 Interakt Response data:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.result) {
        // Store OTP for verification
        await this.storeOTP(phoneNumber, otp);

        return {
          success: true,
          message: 'OTP sent successfully via Interakt',
          data: {
            messageId: responseData.result.messageId,
            to: formattedPhone,
            otp: otp // Include OTP in response for console logging
          }
        };
      } else {
        const errorMessage = responseData.message || 'Failed to send SMS via Interakt';
        console.error('❌ Interakt API Error:', errorMessage);

        return {
          success: false,
          message: errorMessage,
          data: responseData
        };
      }
    } catch (error) {
      console.error('🚨 Interakt SMS send error:', error);
      console.error('🚨 Interakt error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });

      return {
        success: false,
        message: `Network error: ${(error as Error).message}. Please check your connection and try again.`
      };
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<InteraktSMSResponse> {
    try {
      console.log('🔍 Interakt Service: Verifying OTP for:', phoneNumber);
      console.log('🔢 Interakt Service: Entered OTP:', enteredOTP);

      const storedData = await AsyncStorage.getItem(`interakt_otp_${phoneNumber}`);

      if (!storedData) {
        console.log('❌ Interakt Service: No OTP found in storage');
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP.'
        };
      }

      const { otp, expiresAt } = JSON.parse(storedData);
      console.log('🔢 Interakt Service: Stored OTP:', otp);
      console.log('⏰ Interakt Service: Expires at:', new Date(expiresAt));

      // Check if OTP is expired
      if (Date.now() > expiresAt) {
        await AsyncStorage.removeItem(`interakt_otp_${phoneNumber}`);
        console.log('⏰ Interakt Service: OTP expired');
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (otp === enteredOTP) {
        await AsyncStorage.removeItem(`interakt_otp_${phoneNumber}`);
        console.log('✅ Interakt Service: OTP verified successfully');
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        console.log('❌ Interakt Service: OTP mismatch');
        return {
          success: false,
          message: 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('🚨 Interakt OTP verification error:', error);
      return {
        success: false,
        message: 'Error verifying OTP. Please try again.'
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<InteraktSMSResponse> {
    console.log('🔄 Interakt Service: Resending OTP for:', phoneNumber);
    
    // Clear existing OTP
    await AsyncStorage.removeItem(`interakt_otp_${phoneNumber}`);

    // Send new OTP
    return this.sendOTP(phoneNumber);
  }
}

export default new InteraktSMSService();
