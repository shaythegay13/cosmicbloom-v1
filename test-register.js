const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser4',
            email: 'test4@example.com',
            password: 'password123'
        });
        
        console.log('✅ Registration successful!');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.error('❌ Registration failed!');
        console.error('Error:', error.response?.data || error.message);
    }
}

testRegister();
