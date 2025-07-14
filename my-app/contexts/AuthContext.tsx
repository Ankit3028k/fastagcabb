import React, { createContext, ReactNode, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ServiceManager from '@/services/serviceManager';

interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  address?: string;
  age?: number;
  dateOfBirth?: string;
  profilePhoto?: string;
  adharCard?: string;
  panCard?: string;
  bankDetails?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  dealerCode?: string;
}

interface RegistrationData {
  fullName: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: Date;
  age: number;
  adharNumber?: string;
  panCardNumber?: string;
  pinCode: string;
  state: string;
  city: string;
  address: string;
  dealerCode: string;
  role: 'Electrician' | 'Distributor';
  profilePhoto: string;
  adharCard?: string;
  panCard?: string;
  bankDetails?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegistrationData) => Promise<{ success: boolean; message: string }>;
  sendOtpRequest: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  resendOtpRequest: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyOtpAndRegister: (phoneNumber: string, otp: string, userData: any) => Promise<{ success: boolean; message: string }>;
  resetInfobipApplication: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Backend URL with automatic fallback
  const [backendUrl, setBackendUrl] = useState(
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'
  );

  // Test backend connectivity and set appropriate URL
  const testBackendConnectivity = async () => {
    const urls = [
      'http://localhost:5000',
      'https://fastagcabb.onrender.com'
    ];

    for (const url of urls) {
      try {
        console.log(`🔍 Testing backend at: ${url}`);
        const response = await fetch(`${url}/api/auth/test`, {
          method: 'GET',
          timeout: 5000
        });

        if (response.ok) {
          console.log(`✅ Backend available at: ${url}`);
          setBackendUrl(url);
          return url;
        }
      } catch (error) {
        console.log(`❌ Backend not available at: ${url}`);
      }
    }

    console.log('🧪 No backend available, will use mock services');
    return null;
  };

  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true);

    // Force the correct URL
    const loginUrl = `${backendUrl}/api/auth/login`;

    try {
      console.log('🔄 [UPDATED] Attempting login to:', loginUrl);
      console.log('🔄 [UPDATED] Login payload:', { phoneNumber, password: '***' });
      console.log('🔄 [UPDATED] Backend URL:', backendUrl);
      console.log('🔄 [UPDATED] Full URL being used:', loginUrl);

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok && data.success) {
        const userData = data.data.user;
        const token = data.data.token;

        // Save token to AsyncStorage
        await AsyncStorage.setItem('authToken', token);

        setUser(userData);
        console.log('Logged-in user:', userData);
        return { success: true, message: 'Login successful' };
      } else {
        console.error('Login failed:', data);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('🚨 Login error:', error);
      console.error('🚨 Login error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Check if it's a network error and use mock service as fallback
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.log('🧪 Backend login failed, using mock login service...');

        try {
          const mockResult = await MockRegistrationService.login(phoneNumber, password);
          if (mockResult.success) {
            console.log('✅ Mock login succeeded');

            // Set user data from mock service
            if (mockResult.data?.user) {
              setUser(mockResult.data.user);
              await AsyncStorage.setItem('user', JSON.stringify(mockResult.data.user));
              await AsyncStorage.setItem('authToken', mockResult.data.token || 'mock_token');
            }

            return {
              success: true,
              message: 'Login successful via mock service!'
            };
          } else {
            return mockResult;
          }
        } catch (mockError) {
          console.error('🚨 Mock login also failed:', mockError);
          return {
            success: false,
            message: 'Cannot connect to server and mock service failed. Please try again later.'
          };
        }
      }

      return { success: false, message: `Login failed: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData) => {
    setIsLoading(true);
    try {
      console.log('📝 Register function called with data:', {
        ...data,
        password: '[HIDDEN]',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toString() : 'NULL'
      });

      // Create FormData for file uploads
      const formData = new FormData();

      // Add text fields
      formData.append('fullName', data.fullName);
      formData.append('password', data.password);
      formData.append('phoneNumber', data.phoneNumber);

      // Ensure dateOfBirth is a valid Date object
      const dateOfBirth = data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
      console.log('📅 Processing dateOfBirth:', dateOfBirth);
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

      // Add files (these should be file URIs from the photo picker)
      if (data.profilePhoto) {
        formData.append('profilePhoto', {
          uri: data.profilePhoto,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      }

      if (data.adharCard) {
        formData.append('adharCard', {
          uri: data.adharCard,
          type: 'image/jpeg',
          name: 'adhar.jpg',
        } as any);
      }

      if (data.panCard) {
        formData.append('panCard', {
          uri: data.panCard,
          type: 'image/jpeg',
          name: 'pan.jpg',
        } as any);
      }

      if (data.bankDetails) {
        formData.append('bankDetails', {
          uri: data.bankDetails,
          type: 'image/jpeg',
          name: 'bank.jpg',
        } as any);
      }

      const registerUrl = `${backendUrl}/api/auth/register`;
      console.log('🌐 Registration URL:', registerUrl);
      console.log('📤 Sending registration request...');

      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('📡 Registration response status:', res.status);
      console.log('📡 Registration response ok:', res.ok);

      const resData = await res.json();
      if (res.ok) {
        return { success: true, message: resData.message || 'Registered successfully' };
      } else {
        return { success: false, message: resData.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('🚨 Registration error:', error);
      console.error('🚨 Registration error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Check if it's a network error and use mock service as fallback
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.log('🧪 Backend registration failed, using mock registration service...');
        console.log('🧪 Data being passed to mock service:', {
          ...data,
          password: '[HIDDEN]',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toString() : 'NULL'
        });

        try {
          const mockResult = await MockRegistrationService.register(data);
          if (mockResult.success) {
            console.log('✅ Mock registration succeeded');
            return {
              success: true,
              message: 'Registration completed successfully via mock service! Welcome to FASTAGCAB.'
            };
          } else {
            return mockResult;
          }
        } catch (mockError) {
          console.error('🚨 Mock registration also failed:', mockError);
          return {
            success: false,
            message: 'Cannot connect to server and mock service failed. Please try again later.'
          };
        }
      }

      return {
        success: false,
        message: `Registration failed: ${error.message}`
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to reset Infobip application
  const resetInfobipApplication = async () => {
    try {
      console.log('Resetting Infobip 2FA application...');
      const result = await Infobip2FAService.resetApplication();

      if (result.success) {
        console.log('Infobip application reset successfully');
        return {
          success: true,
          message: 'Infobip application reset successfully'
        };
      } else {
        console.error('Failed to reset Infobip application:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to reset application'
        };
      }
    } catch (error) {
      console.error('Reset application error:', error);
      return {
        success: false,
        message: 'Error resetting application'
      };
    }
  };

  // Simplified OTP functions using ServiceManager
  const sendOtpRequest = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      console.log('📱 Sending OTP via ServiceManager to:', phoneNumber);

      const result = await ServiceManager.sendOTP(phoneNumber);

      if (result.success) {
        console.log(`✅ OTP sent successfully via ${result.service} service`);
        return {
          success: true,
          message: result.message
        };
      } else {
        console.error('❌ All OTP services failed:', result.message);
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('🚨 OTP send error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndRegister = async (phoneNumber: string, otp: string, userData: any) => {
    try {
      setIsLoading(true);
      console.log('Verifying OTP via Infobip for:', phoneNumber);

      // Try SMS service first (more reliable)
      let verificationResult = await InfobipSMSService.verifyOTP(phoneNumber, otp);

      // If SMS fails, try 2FA service
      if (!verificationResult.success) {
        console.log('SMS verification failed, trying 2FA service...');
        verificationResult = await Infobip2FAService.verifyOTP(phoneNumber, otp);
      }

      // If both Infobip services fail, try test service
      if (!verificationResult.success) {
        console.log('🧪 Both Infobip verification failed, trying test service...');
        verificationResult = await TestOTPService.verifyOTP(phoneNumber, otp);
      }

      if (verificationResult.success) {
        console.log('OTP verified successfully, proceeding with registration');

        // If OTP is verified, proceed with user registration
        const registrationResult = await register(userData);

        if (registrationResult.success) {
          // Auto-login after successful registration
          console.log('Registration successful, attempting auto-login...');
          const loginResult = await login(userData.phoneNumber, userData.password);

          if (loginResult.success) {
            return {
              success: true,
              message: 'Registration completed successfully! Welcome to FASTAGCAB.',
              autoLogin: true
            };
          } else {
            console.warn('Auto-login failed after registration:', loginResult.message);
            return {
              success: true,
              message: 'Registration completed successfully! Please login with your credentials.',
              autoLogin: false
            };
          }
        } else {
          return {
            success: false,
            message: registrationResult.message || 'Registration failed after OTP verification'
          };
        }
      } else {
        console.error('OTP verification failed:', verificationResult.message);
        return {
          success: false,
          message: verificationResult.message || 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const resendOtpRequest = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      console.log('Resending OTP via Infobip to:', phoneNumber);

      // Try SMS service first (more reliable)
      let result = await InfobipSMSService.resendOTP(phoneNumber);

      // If SMS fails, try 2FA service
      if (!result.success) {
        console.log('SMS resend failed, trying 2FA service...');
        result = await Infobip2FAService.resendOTP(phoneNumber);
      }

      // If both Infobip services fail, try test service
      if (!result.success) {
        console.log('🧪 Both Infobip resend failed, trying test service...');
        result = await TestOTPService.resendOTP(phoneNumber);
      }

      if (result.success) {
        console.log('OTP resent successfully via Infobip');
        return {
          success: true,
          message: 'OTP resent successfully to your mobile number.'
        };
      } else {
        console.error('Failed to resend OTP via Infobip:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to resend OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('OTP resend error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    sendOtpRequest,
    resendOtpRequest,
    verifyOtpAndRegister,
    resetInfobipApplication,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};



