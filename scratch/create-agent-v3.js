const fetch = require('node-fetch');

const DID_API_KEY = 'a2FuYWtzaDg0QGdtYWlsLmNvbQ:0-B6lNhPznW3s_dyd7aHr';
const SAREE_DOCTOR_URL = "https://edamqdqlfscmgxwjdvsa.supabase.co/storage/v1/object/public/consent-videos/avatars/saree_doctor.png";

async function createAgent() {
  console.log('Creating D-ID Agent (Attempt 3: with thumbnail and type: talk)...');
  
  const auth = Buffer.from(`${DID_API_KEY}:`).toString('base64');

  const payload = {
    preview_name: "Dr. Sharma (Saree)",
    presenter: {
      type: "talk",
      source_url: SAREE_DOCTOR_URL,
      thumbnail: SAREE_DOCTOR_URL
    },
    llm: {
      provider: "openai",
      model: "gpt-4o-mini",
      instructions: "You are Dr. Sharma, a warm and empathetic Indian doctor. Explain the surgery, risks, and benefits clearly. Be professional and encouraging."
    }
  };

  try {
    const res = await fetch('https://api.d-id.com/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAgent();
