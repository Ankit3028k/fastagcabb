import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const testRegistration = async () => {
  try {
    console.log('🧪 Testing user registration...');
    
    // Create a simple test image file for profile photo
    const testImageContent = Buffer.from('fake-image-data');
    fs.writeFileSync('test-profile.jpg', testImageContent);
    
    const formData = new FormData();
    
    // Add all the form fields
    formData.append('fullName', 'Rahul Sharma');
    formData.append('phoneNumber', '8959305282');
    formData.append('password', '123456789');
    formData.append('dateOfBirth', '1990-05-15');
    formData.append('age', '34');
    formData.append('adharNumber', '987654321098'); // Different Adhar number
    formData.append('panCardNumber', 'XYZKL5678M'); // Different PAN card
    formData.append('pinCode', '110001');
    formData.append('state', 'Delhi');
    formData.append('city', 'New Delhi');
    formData.append('address', '1234 Street Name, Near Market, New Delhi');
    formData.append('dealerCode', 'DLR002'); // Different dealer code
    formData.append('role', 'Electrician');
    formData.append('status', 'pending');
    formData.append('isVerified', 'false');
    formData.append('monthlyPoints', '0');
    formData.append('yearlyPoints', '0');
    
    // Add the profile photo file
    formData.append('profilePhoto', fs.createReadStream('test-profile.jpg'));
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    // Clean up test file
    fs.unlinkSync('test-profile.jpg');
    
    if (!result.success) {
      console.log('❌ Registration failed as expected');
      console.log('🔍 Error details:');
      console.log('  - Message:', result.message);
      console.log('  - Field:', result.field);
      console.log('  - Conflicting Value:', result.conflictingValue);
    } else {
      console.log('✅ Registration succeeded unexpectedly');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testRegistration();
