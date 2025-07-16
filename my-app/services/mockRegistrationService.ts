import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockRegistrationResponse {
  success: boolean;
  message: string;
  data?: any;
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

class MockRegistrationService {
  // Simulate user registration
  async register(data: RegistrationData): Promise<MockRegistrationResponse> {
    try {
      console.log('🧪 Mock Registration Service: Starting registration for:', data.phoneNumber);
      console.log('🧪 Mock Registration Service: Received data:', {
        ...data,
        password: '[HIDDEN]',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toString() : 'NULL'
      });

      // Fix dateOfBirth if it's not a proper Date object
      let dateOfBirth: Date;
      if (data.dateOfBirth instanceof Date) {
        dateOfBirth = data.dateOfBirth;
      } else if (data.dateOfBirth) {
        dateOfBirth = new Date(data.dateOfBirth);
      } else {
        dateOfBirth = new Date();
      }

      console.log('📅 Mock Service: Processed dateOfBirth:', dateOfBirth);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user already exists
      const existingUsers = await this.getStoredUsers();
      const userExists = existingUsers.some(user => user.phoneNumber === data.phoneNumber);
      
      if (userExists) {
        return {
          success: false,
          message: 'User with this phone number already exists'
        };
      }
      
      // Create user object
      const newUser = {
        id: `user_${Date.now()}`,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: dateOfBirth.toISOString(),
        age: data.age,
        adharNumber: data.adharNumber,
        panCardNumber: data.panCardNumber,
        pinCode: data.pinCode,
        state: data.state,
        city: data.city,
        address: data.address,
        dealerCode: data.dealerCode,
        role: data.role,
        profilePhoto: data.profilePhoto,
        adharCard: data.adharCard,
        panCard: data.panCard,
        bankDetails: data.bankDetails,
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      
      // Store user
      existingUsers.push(newUser);
      await AsyncStorage.setItem('mock_users', JSON.stringify(existingUsers));
      
      console.log('✅ Mock Registration Service: User registered successfully');
      console.log('👤 Mock Registration Service: New user:', {
        ...newUser,
        password: '[HIDDEN]'
      });
      
      return {
        success: true,
        message: 'Registration completed successfully! Welcome to FASTAGCAB.',
        data: {
          user: {
            id: newUser.id,
            fullName: newUser.fullName,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role
          }
        }
      };
    } catch (error: any) {
      console.error('🚨 Mock Registration error:', error);
      console.error('🚨 Mock Registration error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: `Mock registration failed: ${error.message}`
      };
    }
  }
  
  // Get stored users 
  private async getStoredUsers(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('mock_users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  }
  
  // Check if user exists (for login)
  async getUserByPhone(phoneNumber: string): Promise<any | null> {
    try {
      const users = await this.getStoredUsers();
      return users.find(user => user.phoneNumber === phoneNumber) || null;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }
  
  // Simulate login
  async login(phoneNumber: string, password: string): Promise<MockRegistrationResponse> {
    try {
      console.log('🧪 Mock Login Service: Attempting login for:', phoneNumber);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = await this.getUserByPhone(phoneNumber);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.'
        };
      }
      
      // For mock service, we'll accept any password for testing
      // In real implementation, you'd hash and compare passwords
      console.log('✅ Mock Login Service: Login successful');
      
      return {
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role
          },
          token: `mock_token_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('🚨 Mock Login error:', error);
      return {
        success: false,
        message: 'Login failed due to an error'
      };
    }
  }
}

export default new MockRegistrationService();
