const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
    try {
        // Test the test endpoint
        console.log('Testing /api/test endpoint...');
        const testResponse = await axios.get(`${API_URL}/test`);
        console.log('Test endpoint response:', testResponse.data);

        // Test the user profile endpoint
        console.log('\nTesting /api/user/profile endpoint...');
        const profileResponse = await axios.get(`${API_URL}/user/profile`);
        console.log('Profile endpoint response:', profileResponse.data);

        console.log('\nAll tests passed successfully!');
    } catch (error) {
        console.error('API test failed:', error.response ? error.response.data : error.message);
    }
}

testAPI(); 