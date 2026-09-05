const axios = require('axios');

async function checkDevices() {
  const baseUrl = 'http://localhost:3003';
  const username = 'admin';
  const password = 'password123';
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  console.log('--- Checking Active Devices ---');
  try {
    const response = await axios.get(`${baseUrl}/devices`, {
      headers: { 'Authorization': authHeader }
    });
    console.log('Devices:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching devices:', error.response?.data || error.message);
  }
}

checkDevices();
