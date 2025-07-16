import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteraktSMSService from '@/services/interaktSMSService';
import Infobip2FAService from '@/services/infobip2FAService';
import InfobipSMSService from '@/services/infobipSMSService';
import TestOTPService from '@/services/testOTPService';
import MockRegistrationService from '@/services/mockRegistrationService';

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
  monthlyPoints?: number;
  yearlyPoints?: number;
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
  // Additional functions to prevent crashes
  addPoints?: (points: number) => Promise<{ success: boolean; message: string }>;
  processQRCode?: (data: string) => Promise<{ success: boolean; message: string }>;
  processRecharge?: (amount: number) => Promise<{ success: boolean; message: string }>;
  updateUserPoints?: (monthlyPoints: number, yearlyPoints?: number) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check stored auth

  // Use environment variable or fallback to the correct IP for React Native
  // React Native can't connect to localhost, so we need to use the actual IP address
  const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.144.132:5000';

  // Debug: Log the backend URL being used
  console.log('🔧 Environment EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('🔧 Final backendUrl being used:', backendUrl);
  console.log('🔧 React Native Metro server IP detected from logs: 192.168.144.132');

  // Check for stored authentication on app start
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        // Verify token is still valid by making a request to the backend
        try {
          const response = await fetch(`${backendUrl}/api/auth/verify-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
            } else {
              // Token is invalid, clear storage
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
            }
          } else {
            // Token is invalid, clear storage
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
          }
        } catch (error) {
          console.log('Token verification failed, using stored user data:', error);
          // If backend is not reachable, use stored user data
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
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

      // Check content type to avoid JSON parsing errors
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('🚨 Server returned non-JSON response:', contentType);
        const text = await res.text();
        console.error('🚨 Response text:', text.substring(0, 200) + '...');
        return { success: false, message: 'Server returned invalid response format' };
      }

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok && data.success) {
        const userData = data.data.user;
        const token = data.data.token;

        // Save token and user data to AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));

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
      if (error.message.includes('Network request failed') || 
          error.message.includes('fetch') || 
          error.message.includes('JSON Parse error')) {
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
    } catch (error: any) {
      console.error('🚨 Registration error:', error);
      console.error('🚨 Registration error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });

      // Check if it's a network error and use mock service as fallback
      if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
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
        message: `Registration failed: ${error?.message || 'Unknown error'}`
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

  // OTP functions with Interakt as primary service
  const sendOtpRequest = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      console.log('🚀 AUTHCONTEXT: Sending OTP to:', phoneNumber);

      // Use Interakt SMS service as primary
      console.log('🚀 AUTHCONTEXT: Using Interakt SMS service for OTP...');
      const resultInterakt = await InteraktSMSService.sendOTP(phoneNumber);

      if (resultInterakt.success) {
        console.log('✅ OTP sent successfully via Interakt SMS');
        console.log('🔢 Generated OTP (for debugging):', resultInterakt.data?.otp);
        return {
          success: true,
          message: 'OTP sent successfully to your mobile number via Interakt. Please check your SMS.'
        };
      } else {
        console.error('❌ Interakt SMS service failed:', resultInterakt.message);

        // Try Infobip SMS service as fallback
        console.log('🔄 Interakt failed, trying Infobip SMS service as fallback...');
        const resultInfobipSMS = await InfobipSMSService.sendOTP(phoneNumber);

        if (resultInfobipSMS.success) {
          console.log('✅ OTP sent successfully via Infobip SMS');
          return {
            success: true,
            message: 'OTP sent successfully to your mobile number via Infobip. Please check your SMS.'
          };
        } else {
          console.error('❌ Infobip SMS service failed:', resultInfobipSMS.message);

          // Try 2FA service as fallback
          console.log('🔄 Infobip SMS failed, trying 2FA service as fallback...');
          const result2FA = await Infobip2FAService.sendOTP(phoneNumber);

          if (result2FA.success) {
            console.log('✅ OTP sent successfully via Infobip 2FA');
            return {
              success: true,
              message: 'OTP sent successfully to your mobile number via 2FA. Please check your SMS.'
            };
          } else {
            console.error('❌ All primary services failed:', {
              'Interakt': resultInterakt.message,
              'Infobip SMS': resultInfobipSMS.message,
              'Infobip 2FA': result2FA.message
            });

            // Use test OTP service as final fallback
            console.log('🧪 All primary services failed, using test OTP service...');
            const testResult = await TestOTPService.sendOTP(phoneNumber);

            if (testResult.success) {
              console.log('✅ Test OTP service succeeded');
              return {
                success: true,
                message: 'OTP sent successfully via test service. Check console for OTP.'
              };
            } else {
              console.error('❌ All services failed including test service');
              return {
                success: false,
                message: 'All OTP services failed. Please try again later.'
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('OTP send error:', error);
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
      console.log('Verifying OTP for:', phoneNumber);

      // Try Interakt SMS service first (primary)
      console.log('🔍 Trying Interakt SMS verification...');
      let verificationResult = await InteraktSMSService.verifyOTP(phoneNumber, otp);

      // If Interakt fails, try Infobip SMS service
      if (!verificationResult.success) {
        console.log('🔄 Interakt verification failed, trying Infobip SMS service...');
        verificationResult = await InfobipSMSService.verifyOTP(phoneNumber, otp);
      }

      // If Infobip SMS fails, try 2FA service
      if (!verificationResult.success) {
        console.log('🔄 Infobip SMS verification failed, trying 2FA service...');
        verificationResult = await Infobip2FAService.verifyOTP(phoneNumber, otp);
      }

      // If all primary services fail, try test service
      if (!verificationResult.success) {
        console.log('🧪 All primary verification failed, trying test service...');
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
      console.log('Resending OTP to:', phoneNumber);

      // Try Interakt SMS service first (primary)
      console.log('🔄 Trying Interakt SMS resend...');
      let result = await InteraktSMSService.resendOTP(phoneNumber);

      // If Interakt fails, try Infobip SMS service
      if (!result.success) {
        console.log('🔄 Interakt resend failed, trying Infobip SMS service...');
        result = await InfobipSMSService.resendOTP(phoneNumber);
      }

      // If Infobip SMS fails, try 2FA service
      if (!result.success) {
        console.log('🔄 Infobip SMS resend failed, trying 2FA service...');
        result = await Infobip2FAService.resendOTP(phoneNumber);
      }

      // If all primary services fail, try test service
      if (!result.success) {
        console.log('🧪 All primary resend failed, trying test service...');
        result = await TestOTPService.resendOTP(phoneNumber);
      }

      if (result.success) {
        console.log('OTP resent successfully via fallback services');
        return {
          success: true,
          message: 'OTP resent successfully to your mobile number.'
        };
      } else {
        console.error('Failed to resend OTP via all services:', result.message);
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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
    setUser(null);
  };

  // Placeholder functions to prevent crashes - implement as needed
  const addPoints = async (points: number) => {
    console.log('Add points function called with:', points);
    return {
      success: true,
      message: `Added ${points} points successfully!`
    };
  };

  const processQRCode = async (data: string) => {
    try {
      // Get the stored token
      const storedToken = await AsyncStorage.getItem('authToken');

      if (!storedToken) {
        return {
          success: false,
          message: 'Authentication required. Please login again.'
        };
      }

      const response = await fetch(`${backendUrl}/api/qr/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({ qrData: data })
      });

      const result = await response.json();

      if (result.success) {
        // Update user points in context
        setUser(prev => prev ? {
          ...prev,
          monthlyPoints: result.totalMonthlyPoints,
          yearlyPoints: result.totalYearlyPoints
        } : null);
      }

      return result;
    } catch (error) {
      console.error('QR processing error:', error);
      return {
        success: false,
        message: 'Failed to process QR code'
      };
    }
  };

  const processRecharge = async (amount: number) => {
    console.log('Process recharge function called with:', amount);
    return {
      success: true,
      message: `Recharge of ₹${amount} processed successfully!`
    };
  };

  const updateUserPoints = async (monthlyPoints: number, yearlyPoints?: number) => {
    try {
      // Get the stored token
      const storedToken = await AsyncStorage.getItem('authToken');

      if (!storedToken || !user) {
        return {
          success: false,
          message: 'Authentication required. Please login again.'
        };
      }

      const updateData: any = { monthlyPoints };
      if (yearlyPoints !== undefined) {
        updateData.yearlyPoints = yearlyPoints;
      }

      const response = await fetch(`${backendUrl}/api/users/${user._id}/points`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        // Update user points in context
        setUser(prev => prev ? {
          ...prev,
          monthlyPoints: result.data.monthlyPoints,
          yearlyPoints: result.data.yearlyPoints
        } : null);

        // Update stored user data
        if (user) {
          const updatedUser = {
            ...user,
            monthlyPoints: result.data.monthlyPoints,
            yearlyPoints: result.data.yearlyPoints
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      return result;
    } catch (error) {
      console.error('Update user points error:', error);
      return {
        success: false,
        message: 'Failed to update user points'
      };
    }
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
    addPoints,
    processQRCode,
    processRecharge,
    updateUserPoints,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};



