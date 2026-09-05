const axios = require('axios');

async function testListDevices() {
  const baseUrl = 'http://localhost:3006/api';
  const username = 'admin';
  const password = 'password123';
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  console.log('--- Listing Devices from Backend API ---');
  try {
    const response = await axios.get(`${baseUrl}/devices`, {
      headers: { 'Authorization': authHeader }
    });
    console.log('Devices Status:', response.status);
    console.log('Devices Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Status Error:', error.response.status);
      console.error('Data Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Pesan Error:', error.message);
    }
  }
}

testListDevices();
