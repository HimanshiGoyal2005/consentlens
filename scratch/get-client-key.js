const fetch = require('node-fetch');

const DID_API_KEY = 'a2FuYWtzaDg0QGdtYWlsLmNvbQ:0-B6lNhPznW3s_dyd7aHr';
const AGENT_ID = 'v2_agt_Cgmj5Ki0';

async function getClientKey() {
  const auth = Buffer.from(`${DID_API_KEY}`).toString('base64');
  console.log('Generating Client Key...');

  try {
    const res = await fetch(`https://api.d-id.com/agents/${AGENT_ID}/client-key`, {
      method: 'POST',
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

getClientKey();
