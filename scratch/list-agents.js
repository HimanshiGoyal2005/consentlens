const fetch = require('node-fetch');

const DID_API_KEY = 'a2FuYWtzaDg0QGdtYWlsLmNvbQ:0-B6lNhPznW3s_dyd7aHr';

async function listAgents() {
  const auth = Buffer.from(`${DID_API_KEY}:`).toString('base64');
  console.log('Fetching existing D-ID agents...');

  try {
    const res = await fetch('https://api.d-id.com/agents', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAgents();
