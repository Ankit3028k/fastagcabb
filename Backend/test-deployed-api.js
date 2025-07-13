// Test script to check the deployed API on Render
// This will help identify the exact issue with the login endpoint

const API_BASE_URL = 'https://fastagcabb.onrender.com';

// Test data
const testCredentials = {
  phoneNumber: '8959305283',
  password: '000000'
};

async function testEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`\n🔍 Testing ${method} ${endpoint}`);
  console.log('=' .repeat(60));
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Request successful!');
    } else {
      console.log('❌ Request failed!');
    }
    
    return { success: response.ok, data, status: response.status };
    
  } catch (error) {
    console.log('❌ Network error!');
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Deployed API on Render');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  
  // Test 1: Health check
  await testEndpoint('/');
  
  // Test 2: Check if /api prefix works
  await testEndpoint('/api');
  
  // Test 3: Test auth routes with /api prefix
  await testEndpoint('/api/auth/login', 'POST', testCredentials);
  
  // Test 4: Test auth routes without /api prefix
  await testEndpoint('/auth/login', 'POST', testCredentials);
  
  // Test 5: Test auth test route with /api prefix
  await testEndpoint('/api/auth/test');
  
  // Test 6: Test auth test route without /api prefix
  await testEndpoint('/auth/test');
  
  // Test 7: Check available routes
  await testEndpoint('/api/data');
  
  console.log('\n🏁 Test completed!');
}

// Run the tests
runTests().catch(console.error);
