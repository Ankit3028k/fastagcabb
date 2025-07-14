import AsyncStorage from '@react-native-async-storage/async-storage';

interface TestOTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

class TestOTPService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async storeOTP(phoneNumber: string, otp: string): Promise<void> {
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
    await AsyncStorage.setItem(`test_otp_${phoneNumber}`, JSON.stringify({
      otp,
      expiresAt
    }));
  }

  // Send OTP (simulated)
  async sendOTP(phoneNumber: string): Promise<TestOTPResponse> {
    try {
      console.log('🧪 Test OTP Service: Starting OTP send for:', phoneNumber);
      
      // Generate OTP
      const otp = this.generateOTP();
      console.log('🔢 Test OTP Service: Generated OTP:', otp);
      
      // Store OTP
      await this.storeOTP(phoneNumber, otp);
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show OTP in console for testing (remove in production)
      console.log('📱 TEST SMS SIMULATION:');
      console.log('═══════════════════════════════════════');
      console.log(`📞 To: ${phoneNumber}`);
      console.log(`💬 Message: Your FASTAGCAB verification code is ${otp}. Valid for 15 minutes. Do not share this code with anyone.`);
      console.log('═══════════════════════════════════════');
      
      return {
        success: true,
        message: 'OTP sent successfully! Check console for test OTP.',
        data: {
          messageId: `test_${Date.now()}`,
          to: phoneNumber,
          testOTP: otp // Only for testing
        }
      };
    } catch (error) {
      console.error('🚨 Test OTP send error:', error);
      return {
        success: false,
        message: 'Failed to send test OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<TestOTPResponse> {
    try {
      console.log('🧪 Test OTP Service: Verifying OTP for:', phoneNumber);
      
      const storedData = await AsyncStorage.getItem(`test_otp_${phoneNumber}`);
      
      if (!storedData) {
        return {
          success: false,
          message: 'No OTP found for this phone number. Please request a new OTP.'
        };
      }

      const { otp, expiresAt } = JSON.parse(storedData);

      if (Date.now() > expiresAt) {
        await AsyncStorage.removeItem(`test_otp_${phoneNumber}`);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      if (otp === enteredOTP) {
        await AsyncStorage.removeItem(`test_otp_${phoneNumber}`);
        console.log('✅ Test OTP Service: OTP verified successfully');
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        console.log('❌ Test OTP Service: Invalid OTP entered');
        return {
          success: false,
          message: 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('🚨 Test OTP verify error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<TestOTPResponse> {
    try {
      console.log('🧪 Test OTP Service: Resending OTP for:', phoneNumber);
      
      // Clear existing OTP
      await AsyncStorage.removeItem(`test_otp_${phoneNumber}`);
      
      // Send new OTP
      return await this.sendOTP(phoneNumber);
    } catch (error) {
      console.error('🚨 Test OTP resend error:', error);
      return {
        success: false,
        message: 'Failed to resend OTP'
      };
    }
  }
}

export default new TestOTPService();
