// Test script to register a user for testing login
const API_BASE_URL = 'https://fastagcabb.onrender.com/api';

// Test user data for registration
const testUserData = {
  fullName: 'Test User',
  phoneNumber: '8959305283',
  password: '000000',
  dateOfBirth: '1990-01-01',
  age: 34,
  adharNumber: '123456789012',
  panCardNumber: 'ABCDE1234F',
  pinCode: '123456',
  state: 'Test State',
  city: 'Test City',
  address: 'Test Address 123',
  dealerCode: 'TEST123',
  role: 'Electrician'
};

async function testRegistration() {
  console.log('🔐 Testing User Registration');
  console.log('=' .repeat(50));
  console.log('Phone Number:', testUserData.phoneNumber);
  console.log('Password:', testUserData.password);
  
  try {
    // Note: Registration requires multipart/form-data for file uploads
    // For testing, we'll try with JSON first to see the error
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Registration successful!');
      console.log(`User: ${data.data.user.fullName}`);
      console.log(`Phone: ${data.data.user.phoneNumber}`);
    } else {
      console.log('❌ Registration failed!');
      console.log(`Error: ${data.message}`);
      if (data.errors) {
        console.log('Validation errors:', data.errors);
      }
    }
    
  } catch (error) {
    console.log('❌ Network error!');
    console.error('Error:', error.message);
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login After Registration');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testUserData.phoneNumber,
        password: testUserData.password
      })
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log(`User: ${data.data.user.fullName}`);
      console.log(`Role: ${data.data.user.role}`);
      console.log(`Token: ${data.data.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Login failed!');
      console.log(`Error: ${data.message}`);
    }
    
  } catch (error) {
    console.log('❌ Network error!');
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 USER REGISTRATION & LOGIN TEST');
  console.log('=' .repeat(50));
  
  // First try to register the user
  await testRegistration();
  
  // Wait a moment then try to login
  console.log('\nWaiting 2 seconds before login test...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testLogin();
  
  console.log('\n📝 Test completed!');
  console.log('Note: Registration requires file uploads (profilePhoto, etc.)');
  console.log('If registration fails due to missing files, the user might already exist.');
}

// Run the tests
runTests().catch(console.error);
