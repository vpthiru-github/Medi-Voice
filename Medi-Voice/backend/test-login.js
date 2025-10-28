const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'Patient',
  email: 'test@patient.com',
  password: 'TestPassword123',
  phone: '+1234567890'
};

async function testAuthFlow() {
  try {
    console.log('=== Testing Authentication Flow ===\n');

    // 1. Test registration
    console.log('1. Testing Registration...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', JSON.stringify(registerData, null, 2));

    if (!registerResponse.ok && !registerData.message.includes('already exists')) {
      console.error('Registration failed:', registerData.message);
      return;
    }

    // 2. Test login
    console.log('\n2. Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('Token received:', token);

    // 3. Test /auth/me endpoint
    console.log('\n3. Testing /auth/me endpoint...');
    const meResponse = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const meData = await meResponse.json();
    console.log('Me Response:', JSON.stringify(meData, null, 2));

    if (meResponse.ok) {
      console.log('\n✅ Authentication flow test PASSED!');
    } else {
      console.log('\n❌ Authentication flow test FAILED at /auth/me');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuthFlow();