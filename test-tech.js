const axios = require('axios');

async function testTechniciansApi() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://127.0.0.1:3000/api/v1/auth/login', {
      email: 'admin@tecnotaller.com',
      password: 'Admin123!@#'
    });
    
    const token = loginRes.data.accessToken;
    
    // 2. Fetch technicians
    const techRes = await axios.get('http://127.0.0.1:3000/api/v1/technicians', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Response data:", JSON.stringify(techRes.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testTechniciansApi();
