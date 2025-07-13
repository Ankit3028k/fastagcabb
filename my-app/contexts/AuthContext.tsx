import React, { createContext, ReactNode, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  verifyOtpAndRegister: (phoneNumber: string, otp: string, userData: any) => Promise<{ success: boolean; message: string }>;
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

  // Use environment variable or fallback to deployed URL
  // Remove /api suffix as it should be included in the route definitions
  const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://fastagcabb.onrender.com';

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
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData) => {
    setIsLoading(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add text fields
      formData.append('fullName', data.fullName);
      formData.append('password', data.password);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('dateOfBirth', data.dateOfBirth.toISOString().split('T')[0]);
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

      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const resData = await res.json();
      if (res.ok) {
        return { success: true, message: resData.message || 'Registered successfully' };
      } else {
        return { success: false, message: resData.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Mock OTP functions for now (you can implement real OTP service later)
  const sendOtpRequest = async (phoneNumber: string) => {
    try {
      // For now, just return success (you can integrate with SMS service later)
      console.log('Sending OTP to:', phoneNumber);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOtpAndRegister = async (phoneNumber: string, otp: string, userData: any) => {
    try {
      // For now, just verify with a dummy OTP (you can implement real verification later)
      if (otp === '123456' || otp === '1234') {
        // If OTP is correct, proceed with registration
        const result = await register(userData);
        return result;
      } else {
        return { success: false, message: 'Invalid OTP' };
      }
    } catch (error) {
      return { success: false, message: 'Verification failed' };
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
    verifyOtpAndRegister,
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



