import AsyncStorage from '@react-native-async-storage/async-storage';

// Infobip 2FA Configuration
const INFOBIP_CONFIG = {
  baseURL: 'https://ypqwxp.api.infobip.com',
  apiKey: '5830f3c890eba242e7bf4e33e4dec772-f871e7d3-5cd4-48bc-ba6d-d590ff3f541e',
  applicationId: '', // Will be set after creating application
};

interface InfobipResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface ApplicationConfig {
  name: string;
  enabled: boolean;
  configuration: {
    pinAttempts: number;
    allowMultiplePinVerifications: boolean;
    pinTimeToLive: string;
    verifyPinLimit: string;
    sendPinPerApplicationLimit: string;
    sendPinPerPhoneNumberLimit: string;
    pinType?: string;
    pinLength?: number;
  };
}

class Infobip2FAService {
  private applicationId: string | null = null;

  constructor() {
    this.loadApplicationId();
  }

  private async loadApplicationId() {
    try {
      const storedAppId = await AsyncStorage.getItem('infobip_app_id');
      if (storedAppId) {
        this.applicationId = storedAppId;
        INFOBIP_CONFIG.applicationId = storedAppId;
      }
    } catch (error) {
      console.error('Error loading application ID:', error);
    }
  }

  private async saveApplicationId(appId: string) {
    try {
      await AsyncStorage.setItem('infobip_app_id', appId);
      this.applicationId = appId;
      INFOBIP_CONFIG.applicationId = appId;
    } catch (error) {
      console.error('Error saving application ID:', error);
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<InfobipResponse> {
    try {
      const url = `${INFOBIP_CONFIG.baseURL}${endpoint}`;
      
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `App ${INFOBIP_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      console.log(`Making ${method} request to:`, url);
      console.log('Request headers:', options.headers);
      console.log('Request data:', JSON.stringify(data, null, 2));

      const response = await fetch(url, options);
      const responseData = await response.json();

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response data:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        return {
          success: true,
          message: 'Request successful',
          data: responseData,
        };
      } else {
        const errorMessage = responseData.requestError?.serviceException?.text ||
                           responseData.requestError?.serviceException?.messageId ||
                           responseData.message ||
                           `HTTP ${response.status}: ${response.statusText}`;

        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: responseData
        });

        return {
          success: false,
          message: errorMessage,
          data: responseData,
        };
      }
    } catch (error) {
      console.error('Request error:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Create message template
  async createMessageTemplate(): Promise<InfobipResponse> {
    if (!this.applicationId) {
      return {
        success: false,
        message: 'Application ID not found'
      };
    }

    const templateConfig = {
      messageText: "Your {{companyName}} verification code is {{pin}}. Valid for 15 minutes. Do not share this code with anyone.",
      pinPlaceholder: "{{pin}}",
      messageType: "TEXT",
      language: "en",
      pinType: "NUMERIC",
      pinLength: 6
    };

    return this.makeRequest(`/2fa/2/applications/${this.applicationId}/messages`, 'POST', templateConfig);
  }

  // Create 2FA Application (call this once during app setup)
  async createApplication(): Promise<InfobipResponse> {
    const applicationConfig: ApplicationConfig = {
      name: "FASTAGCAB 2FA Application",
      enabled: true,
      configuration: {
        pinAttempts: 10,
        allowMultiplePinVerifications: false,
        pinTimeToLive: "15m",
        verifyPinLimit: "1/3s",
        sendPinPerApplicationLimit: "1000/1d",
        sendPinPerPhoneNumberLimit: "10/1d",
        pinType: "NUMERIC",
        pinLength: 6
      }
    };

    const result = await this.makeRequest('/2fa/2/applications', 'POST', applicationConfig);

    if (result.success && result.data?.applicationId) {
      await this.saveApplicationId(result.data.applicationId);
      console.log('2FA Application created with ID:', result.data.applicationId);

      // Create message template after application is created
      const templateResult = await this.createMessageTemplate();
      if (templateResult.success) {
        console.log('Message template created successfully');
      } else {
        console.warn('Failed to create message template:', templateResult.message);
      }
    }

    return result;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<InfobipResponse> {
    // Ensure we have an application ID
    if (!this.applicationId) {
      const appResult = await this.createApplication();
      if (!appResult.success) {
        return appResult;
      }
    }

    // Format phone number (ensure it starts with country code)
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

    // Try different request formats
    const otpDataOptions = [
      // Option 1: Standard format with required fields
      {
        applicationId: this.applicationId,
        messageId: `FASTAGCAB_${Date.now()}`,
        from: "FASTAGCAB",
        to: formattedPhone,
        pinType: "NUMERIC",
        pinLength: 6
      },
      // Option 2: With message template
      {
        applicationId: this.applicationId,
        messageId: `FASTAGCAB_${Date.now()}`,
        from: "FASTAGCAB",
        to: formattedPhone,
        messageText: "Your FASTAGCAB verification code is {{pin}}. Valid for 15 minutes. Do not share this code with anyone.",
        pinType: "NUMERIC",
        pinLength: 6
      },
      // Option 3: With placeholders
      {
        applicationId: this.applicationId,
        messageId: `FASTAGCAB_${Date.now()}`,
        from: "FASTAGCAB",
        to: formattedPhone,
        messageText: "Your {{companyName}} verification code is {{pin}}. Valid for 15 minutes. Do not share this code with anyone.",
        placeholders: {
          "companyName": "FASTAGCAB"
        },
        pinType: "NUMERIC",
        pinLength: 6
      }
    ];

    // Try each option until one succeeds
    for (let i = 0; i < otpDataOptions.length; i++) {
      console.log(`Trying OTP request format ${i + 1}:`, otpDataOptions[i]);

      const result = await this.makeRequest('/2fa/2/pin', 'POST', otpDataOptions[i]);

      if (result.success) {
        // Store the PIN ID for verification
        if (result.data?.pinId) {
          await AsyncStorage.setItem(`otp_${phoneNumber}`, result.data.pinId);
        }

        console.log(`OTP request successful with format ${i + 1}`);
        return {
          success: true,
          message: 'OTP sent successfully to your mobile number',
          data: result.data,
        };
      } else {
        console.log(`Format ${i + 1} failed:`, result.message);
        if (i === otpDataOptions.length - 1) {
          // Last attempt failed, return the error
          return result;
        }
      }
    }

    return {
      success: false,
      message: 'All OTP request formats failed'
    };
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, otp: string): Promise<InfobipResponse> {
    try {
      // Get stored PIN ID
      const pinId = await AsyncStorage.getItem(`otp_${phoneNumber}`);
      
      if (!pinId) {
        return {
          success: false,
          message: 'No OTP found for this phone number. Please request a new OTP.',
        };
      }

      const verificationData = {
        pin: otp
      };

      const result = await this.makeRequest(`/2fa/2/pin/${pinId}/verify`, 'POST', verificationData);
      
      if (result.success) {
        // Clean up stored PIN ID after successful verification
        await AsyncStorage.removeItem(`otp_${phoneNumber}`);
        
        return {
          success: true,
          message: 'OTP verified successfully',
          data: result.data,
        };
      }

      return {
        success: false,
        message: result.data?.verified === false ? 'Invalid OTP. Please try again.' : result.message,
        data: result.data,
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<InfobipResponse> {
    // Clean up any existing OTP for this number
    await AsyncStorage.removeItem(`otp_${phoneNumber}`);

    // Send new OTP
    return this.sendOTP(phoneNumber);
  }

  // Get application status
  async getApplicationStatus(): Promise<InfobipResponse> {
    if (!this.applicationId) {
      return {
        success: false,
        message: 'No application ID found',
      };
    }

    return this.makeRequest(`/2fa/2/applications/${this.applicationId}`);
  }

  // Reset application (for debugging)
  async resetApplication(): Promise<InfobipResponse> {
    try {
      // Clear stored application ID
      await AsyncStorage.removeItem('infobip_app_id');
      this.applicationId = null;
      INFOBIP_CONFIG.applicationId = '';

      // Create new application
      return await this.createApplication();
    } catch (error) {
      console.error('Error resetting application:', error);
      return {
        success: false,
        message: 'Failed to reset application'
      };
    }
  }
}

export default new Infobip2FAService();
