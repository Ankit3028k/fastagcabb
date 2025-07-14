import AsyncStorage from '@react-native-async-storage/async-storage';
import TestOTPService from './testOTPService';
import MockRegistrationService from './mockRegistrationService';
import InfobipSMSService from './infobipSMSService';

interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  service?: 'backend' | 'mock' | 'test';
}

class ServiceManager {
  private backendUrl: string = 'http://localhost:5000';
  private isBackendAvailable: boolean = false;
  
  // Test backend connectivity
  async testBackend(): Promise<boolean> {
    const urls = [
      'http://localhost:5000',
      'https://fastagcabb.onrender.com'
    ];
    
    for (const url of urls) {
      try {
        console.log(`🔍 Testing backend at: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${url}/api/auth/test`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Backend available at: ${url}`);
          this.backendUrl = url;
          this.isBackendAvailable = true;
          return true;
        }
      } catch (error) {
        console.log(`❌ Backend not available at: ${url}`, error.message);
      }
    }
    
    console.log('🧪 No backend available, using mock services');
    this.isBackendAvailable = false;
    return false;
  }
  
  // Send OTP with automatic fallback
  async sendOTP(phoneNumber: string): Promise<ServiceResponse> {
    console.log('📱 ServiceManager: Sending OTP...');
    
    // Always try SMS service first (most reliable)
    try {
      const smsResult = await InfobipSMSService.sendOTP(phoneNumber);
      if (smsResult.success) {
        return {
          success: true,
          message: smsResult.message,
          data: smsResult.data,
          service: 'backend'
        };
      }
    } catch (error) {
      console.log('📱 SMS service failed, trying test service...');
    }
    
    // Fallback to test service
    try {
      const testResult = await TestOTPService.sendOTP(phoneNumber);
      return {
        success: testResult.success,
        message: testResult.message,
        data: testResult.data,
        service: 'test'
      };
    } catch (error) {
      return {
        success: false,
        message: 'All OTP services failed',
        service: 'test'
      };
    }
  }
  
  // Verify OTP with automatic fallback
  async verifyOTP(phoneNumber: string, otp: string): Promise<ServiceResponse> {
    console.log('🔍 ServiceManager: Verifying OTP...');
    
    // Try SMS service first
    try {
      const smsResult = await InfobipSMSService.verifyOTP(phoneNumber, otp);
      if (smsResult.success) {
        return {
          success: true,
          message: smsResult.message,
          service: 'backend'
        };
      }
    } catch (error) {
      console.log('🔍 SMS verification failed, trying test service...');
    }
    
    // Fallback to test service
    try {
      const testResult = await TestOTPService.verifyOTP(phoneNumber, otp);
      return {
        success: testResult.success,
        message: testResult.message,
        service: 'test'
      };
    } catch (error) {
      return {
        success: false,
        message: 'All OTP verification services failed',
        service: 'test'
      };
    }
  }
  
  // Register user with automatic fallback
  async register(data: any): Promise<ServiceResponse> {
    console.log('📝 ServiceManager: Registering user...');
    
    // Test backend connectivity first
    await this.testBackend();
    
    if (this.isBackendAvailable) {
      try {
        console.log('🌐 Trying backend registration...');
        
        // Create FormData for backend
        const formData = new FormData();
        
        // Add text fields
        formData.append('fullName', data.fullName);
        formData.append('password', data.password);
        formData.append('phoneNumber', data.phoneNumber);
        
        // Handle dateOfBirth safely
        const dateOfBirth = data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
        formData.append('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
        
        formData.append('age', data.age.toString());
        formData.append('pinCode', data.pinCode);
        formData.append('state', data.state);
        formData.append('city', data.city);
        formData.append('address', data.address);
        formData.append('dealerCode', data.dealerCode);
        formData.append('role', data.role);
        
        // Add optional fields
        if (data.adharNumber) formData.append('adharNumber', data.adharNumber);
        if (data.panCardNumber) formData.append('panCardNumber', data.panCardNumber);
        
        // Add files (simplified for now)
        if (data.profilePhoto) {
          formData.append('profilePhoto', {
            uri: data.profilePhoto,
            type: 'image/jpeg',
            name: 'profile.jpg',
          } as any);
        }
        
        const response = await fetch(`${this.backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          return {
            success: true,
            message: responseData.message || 'Registration successful',
            data: responseData,
            service: 'backend'
          };
        } else {
          throw new Error(responseData.message || 'Backend registration failed');
        }
      } catch (error) {
        console.log('🌐 Backend registration failed:', error.message);
      }
    }
    
    // Fallback to mock service
    console.log('🧪 Using mock registration service...');
    try {
      const mockResult = await MockRegistrationService.register(data);
      return {
        success: mockResult.success,
        message: mockResult.message,
        data: mockResult.data,
        service: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        message: `All registration services failed: ${error.message}`,
        service: 'mock'
      };
    }
  }
  
  // Login user with automatic fallback
  async login(phoneNumber: string, password: string): Promise<ServiceResponse> {
    console.log('🔑 ServiceManager: Logging in user...');
    
    // Test backend connectivity first
    await this.testBackend();
    
    if (this.isBackendAvailable) {
      try {
        console.log('🌐 Trying backend login...');
        
        const response = await fetch(`${this.backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, password }),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          return {
            success: true,
            message: responseData.message || 'Login successful',
            data: responseData,
            service: 'backend'
          };
        } else {
          throw new Error(responseData.message || 'Backend login failed');
        }
      } catch (error) {
        console.log('🌐 Backend login failed:', error.message);
      }
    }
    
    // Fallback to mock service
    console.log('🧪 Using mock login service...');
    try {
      const mockResult = await MockRegistrationService.login(phoneNumber, password);
      return {
        success: mockResult.success,
        message: mockResult.message,
        data: mockResult.data,
        service: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        message: `All login services failed: ${error.message}`,
        service: 'mock'
      };
    }
  }
}

export default new ServiceManager();
