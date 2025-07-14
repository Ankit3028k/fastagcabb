import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_PHONE = '8959305284';

// Test OTP functionality
async function testOTPFlow() {
    console.log('🧪 Testing Backend OTP Flow...\n');

    try {
        // Test 1: Send OTP
        console.log('1️⃣ Testing Send OTP...');
        const sendResponse = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: TEST_PHONE
            })
        });

        const sendData = await sendResponse.json();
        console.log('Send OTP Response:', sendData);

        if (sendData.success) {
            console.log('✅ Send OTP: SUCCESS\n');
            
            // Prompt for OTP (in real test, you'd get this from SMS)
            console.log('📱 Check your phone for OTP and enter it when testing verify endpoint\n');
            
            // Test 2: Verify OTP (you'll need to manually enter the OTP)
            const testOTP = '123456'; // Replace with actual OTP from SMS
            console.log('2️⃣ Testing Verify OTP (with test OTP)...');
            
            const verifyResponse = await fetch(`${BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: TEST_PHONE,
                    otp: testOTP
                })
            });

            const verifyData = await verifyResponse.json();
            console.log('Verify OTP Response:', verifyData);
            
            if (verifyData.success) {
                console.log('✅ Verify OTP: SUCCESS\n');
            } else {
                console.log('❌ Verify OTP: FAILED (expected with test OTP)\n');
            }

            // Test 3: Resend OTP
            console.log('3️⃣ Testing Resend OTP...');
            const resendResponse = await fetch(`${BASE_URL}/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: TEST_PHONE
                })
            });

            const resendData = await resendResponse.json();
            console.log('Resend OTP Response:', resendData);
            
            if (resendData.success) {
                console.log('✅ Resend OTP: SUCCESS\n');
            } else {
                console.log('❌ Resend OTP: FAILED\n');
            }

        } else {
            console.log('❌ Send OTP: FAILED\n');
        }

    } catch (error) {
        console.error('🚨 Test Error:', error.message);
    }
}

// Test validation
async function testValidation() {
    console.log('🔍 Testing Validation...\n');

    try {
        // Test invalid phone number
        console.log('Testing invalid phone number...');
        const invalidResponse = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: '123' // Invalid
            })
        });

        const invalidData = await invalidResponse.json();
        console.log('Invalid Phone Response:', invalidData);
        
        if (!invalidData.success && invalidData.errors) {
            console.log('✅ Validation: Working correctly\n');
        } else {
            console.log('❌ Validation: Not working\n');
        }

    } catch (error) {
        console.error('🚨 Validation Test Error:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Backend OTP Tests...\n');
    console.log('Make sure the backend server is running on port 5000\n');
    
    await testValidation();
    await testOTPFlow();
    
    console.log('✨ Tests completed!');
    console.log('\n📝 Manual Testing Steps:');
    console.log('1. Run: node test-otp.js');
    console.log('2. Check your phone for OTP SMS');
    console.log('3. Test verify-otp endpoint with actual OTP');
    console.log('4. Verify all endpoints work correctly');
}

runTests();
