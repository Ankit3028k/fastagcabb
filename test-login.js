// Test script for login route
// Using built-in fetch (Node.js 18+) or fallback to https module

const API_BASE_URL = 'http://192.168.186.132:5000/api';

// Test data - you can modify these credentials
const testCredentials = [
  {
    phoneNumber: '9876543210',
    password: 'password123'
  },
  {
    phoneNumber: '9123456789',
    password: 'testpass'
  }
];

async function testLogin(phoneNumber, password) {
  console.log(`\n🔐 Testing login with phone: ${phoneNumber}`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        password
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

async function testAuthRoute() {
  console.log('🚀 Testing Auth Route Connection');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/test`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Auth routes are working!');
    } else {
      console.log('❌ Auth routes not working!');
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend!');
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 LOGIN ROUTE TESTING SCRIPT');
  console.log('=' .repeat(50));
  
  // First test if backend is reachable
  await testAuthRoute();
  
  // Test login with different credentials
  for (const creds of testCredentials) {
    await testLogin(creds.phoneNumber, creds.password);
  }
  
  console.log('\n📝 Test completed!');
  console.log('If login fails, make sure:');
  console.log('1. Backend server is running on port 5000');
  console.log('2. MongoDB is connected');
  console.log('3. Test users exist in database');
  console.log('4. Phone numbers and passwords are correct');
}

// Run the tests
runTests().catch(console.error);
