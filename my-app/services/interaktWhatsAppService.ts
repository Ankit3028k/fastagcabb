import AsyncStorage from '@react-native-async-storage/async-storage';

interface InteraktWhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
}

class InteraktWhatsAppService {
  // Interakt WhatsApp API configuration
  private baseURL = 'https://api.interakt.ai';
  private apiKey = 'YOUR_INTERAKT_API_KEY'; // Replace with actual API key from Interakt dashboard
  private templateId = 'otp_verification'; // Replace with your actual WhatsApp template name

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
    await AsyncStorage.setItem(`interakt_whatsapp_otp_${phoneNumber}`, JSON.stringify(otpData));
    console.log('🔢 Interakt WhatsApp Service: OTP stored for verification:', otp);
  }

  // Send WhatsApp OTP using Interakt API
  async sendOTP(phoneNumber: string): Promise<InteraktWhatsAppResponse> {
    try {
      console.log('📱 Interakt WhatsApp Service: Starting OTP send for:', phoneNumber);

      // Generate OTP
      const otp = this.generateOTP();
      console.log('🔢 Interakt WhatsApp Service: Generated OTP:', otp);

      // Format phone number (Interakt expects format without +)
      const formattedPhone = phoneNumber.replace(/^\+/, '');
      console.log('📞 Interakt WhatsApp Service: Formatted phone:', formattedPhone);

      // Prepare WhatsApp message data for Interakt
      const messageData = {
        countryCode: "+91",
        phoneNumber: formattedPhone,
        type: "Template",
        template: {
          name: "otp_verification", // Replace with your WhatsApp template name
          languageCode: "en",
          headerValues: [],
          bodyValues: [otp, "15"], // OTP and expiry time
          buttonValues: []
        }
      };

      console.log('🌐 Interakt WhatsApp Service: Making API request');
      console.log('📤 Interakt WhatsApp Service: Request data:', JSON.stringify(messageData, null, 2));

      const response = await fetch(`${this.baseURL}/v1/public/message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      console.log('📡 Interakt WhatsApp Service: Response received, status:', response.status);

      const responseData = await response.json();
      console.log('📥 Interakt WhatsApp Response data:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.result) {
        // Store OTP for verification
        await this.storeOTP(phoneNumber, otp);

        return {
          success: true,
          message: 'OTP sent successfully to your WhatsApp',
          data: {
            messageId: responseData.result.messageId,
            to: formattedPhone,
            otp: otp // Include OTP in response for console logging
          }
        };
      } else {
        const errorMessage = responseData.message || 'Failed to send WhatsApp message via Interakt';
        console.error('❌ Interakt WhatsApp API Error:', errorMessage);

        return {
          success: false,
          message: errorMessage,
          data: responseData
        };
      }
    } catch (error) {
      console.error('🚨 Interakt WhatsApp send error:', error);
      console.error('🚨 Interakt WhatsApp error details:', {
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
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<InteraktWhatsAppResponse> {
    try {
      console.log('🔍 Interakt WhatsApp Service: Verifying OTP for:', phoneNumber);
      console.log('🔢 Interakt WhatsApp Service: Entered OTP:', enteredOTP);

      const storedData = await AsyncStorage.getItem(`interakt_whatsapp_otp_${phoneNumber}`);

      if (!storedData) {
        console.log('❌ Interakt WhatsApp Service: No OTP found in storage');
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP.'
        };
      }

      const { otp, expiresAt } = JSON.parse(storedData);
      console.log('🔢 Interakt WhatsApp Service: Stored OTP:', otp);
      console.log('⏰ Interakt WhatsApp Service: Expires at:', new Date(expiresAt));

      // Check if OTP is expired
      if (Date.now() > expiresAt) {
        await AsyncStorage.removeItem(`interakt_whatsapp_otp_${phoneNumber}`);
        console.log('⏰ Interakt WhatsApp Service: OTP expired');
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (otp === enteredOTP) {
        await AsyncStorage.removeItem(`interakt_whatsapp_otp_${phoneNumber}`);
        console.log('✅ Interakt WhatsApp Service: OTP verified successfully');
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        console.log('❌ Interakt WhatsApp Service: OTP mismatch');
        return {
          success: false,
          message: 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('🚨 Interakt WhatsApp OTP verification error:', error);
      return {
        success: false,
        message: 'Error verifying OTP. Please try again.'
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<InteraktWhatsAppResponse> {
    console.log('🔄 Interakt WhatsApp Service: Resending OTP for:', phoneNumber);
    
    // Clear existing OTP
    await AsyncStorage.removeItem(`interakt_whatsapp_otp_${phoneNumber}`);

    // Send new OTP
    return this.sendOTP(phoneNumber);
  }
}

export default new InteraktWhatsAppService();
