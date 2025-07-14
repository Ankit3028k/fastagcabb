import AsyncStorage from '@react-native-async-storage/async-storage';

interface InfobipSMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

class InfobipSMSService {
  private baseURL = 'https://ypqwxp.api.infobip.com';
  private apiKey = '5830f3c890eba242e7bf4e33e4dec772-f871e7d3-5cd4-48bc-ba6d-d590ff3f541e';

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
    await AsyncStorage.setItem(`sms_otp_${phoneNumber}`, JSON.stringify(otpData));
  }

  // Send SMS using Infobip SMS API
  async sendOTP(phoneNumber: string): Promise<InfobipSMSResponse> {
    try {
      console.log('📱 SMS Service: Starting OTP send for:', phoneNumber);

      // Generate OTP
      const otp = this.generateOTP();
      console.log('🔢 SMS Service: Generated OTP:', otp);

      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      console.log('📞 SMS Service: Formatted phone:', formattedPhone);

      // Prepare SMS message
      const message = `Your FASTAGCAB verification code is ${otp}. Valid for 15 minutes. Do not share this code with anyone.`;
      console.log('💬 SMS Service: Message prepared:', message);
      
      // SMS API request
      const smsData = {
        messages: [
          {
            from: "FASTAGCAB",
            destinations: [
              {
                to: formattedPhone
              }
            ],
            text: message
          }
        ]
      };

      console.log('Sending SMS via Infobip to:', formattedPhone);
      console.log('SMS data:', JSON.stringify(smsData, null, 2));

      console.log('🌐 SMS Service: Making fetch request to:', `${this.baseURL}/sms/2/text/advanced`);

      const response = await fetch(`${this.baseURL}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
          'Authorization': `App ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(smsData)
      });

      console.log('📡 SMS Service: Response received, status:', response.status);

      const responseData = await response.json();
      
      console.log('SMS Response status:', response.status);
      console.log('SMS Response data:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.messages && responseData.messages[0].status.groupId === 1) {
        // Store OTP for verification
        await this.storeOTP(phoneNumber, otp);
        
        return {
          success: true,
          message: 'OTP sent successfully to your mobile number',
          data: {
            messageId: responseData.messages[0].messageId,
            to: formattedPhone
          }
        };
      } else {
        const errorMessage = responseData.messages?.[0]?.status?.description || 
                           responseData.requestError?.serviceException?.text ||
                           'Failed to send SMS';
        
        return {
          success: false,
          message: errorMessage,
          data: responseData
        };
      }
    } catch (error) {
      console.error('🚨 SMS send error:', error);
      console.error('🚨 SMS error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: `Network error: ${error.message}. Please check your connection and try again.`
      };
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<InfobipSMSResponse> {
    try {
      const storedData = await AsyncStorage.getItem(`sms_otp_${phoneNumber}`);
      
      if (!storedData) {
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP.'
        };
      }

      const { otp, expiresAt } = JSON.parse(storedData);

      // Check if OTP is expired
      if (Date.now() > expiresAt) {
        await AsyncStorage.removeItem(`sms_otp_${phoneNumber}`);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (otp === enteredOTP) {
        await AsyncStorage.removeItem(`sms_otp_${phoneNumber}`);
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Error verifying OTP. Please try again.'
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<InfobipSMSResponse> {
    // Clear existing OTP
    await AsyncStorage.removeItem(`sms_otp_${phoneNumber}`);
    
    // Send new OTP
    return this.sendOTP(phoneNumber);
  }
}

export default new InfobipSMSService();
