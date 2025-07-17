// Test the original payload that was failing
import fetch from 'node-fetch';

const testOriginalPayload = async () => {
  try {
    console.log('🧪 Testing original payload that was failing...');
    
    const payload = {
      "fullName": "Rahul Sharma",
      "phoneNumber": "8959305282",
      "password": "123456789",
      "dateOfBirth": "1990-05-15",
      "age": 34,
      "adharNumber": "123456789012",
      "panCardNumber": "ABCDE1234F",
      "pinCode": "110001",
      "state": "Delhi",
      "city": "New Delhi",
      "address": "1234 Street Name, Near Market, New Delhi",
      "dealerCode": "DLR001",
      "role": "Electrician",
      "status": "pending",
      "isVerified": false,
      "monthlyPoints": 0,
      "yearlyPoints": 0
    };
    
    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log('✅ Registration correctly failed with specific error');
      console.log('🔍 Error details:');
      console.log('  - Message:', result.message);
      console.log('  - Field:', result.field || 'Not specified');
      console.log('  - Conflicting Value:', result.conflictingValue || 'Not specified');
      
      // Check if we got a specific field error instead of generic "User already exists"
      if (result.field && result.message !== 'User already exists') {
        console.log('🎉 SUCCESS: Now providing specific error messages!');
      } else {
        console.log('❌ ISSUE: Still getting generic error message');
      }
    } else {
      console.log('❌ Registration unexpectedly succeeded');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testOriginalPayload();
