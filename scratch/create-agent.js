const fetch = require('node-fetch');

const DID_API_KEY = 'a2FuYWtzaDg0QGdtYWlsLmNvbQ:0-B6lNhPznW3s_dyd7aHr';
const SAREE_DOCTOR_URL = "https://edamqdqlfscmgxwjdvsa.supabase.co/storage/v1/object/public/consent-videos/avatars/saree_doctor.png";

async function createAgent() {
  console.log('Creating D-ID Agent with Saree Doctor persona...');
  
  const auth = Buffer.from(`${DID_API_KEY}:`).toString('base64');

  const payload = {
    preview_name: "Dr. Saree - ConsentLens",
    presenter: {
      type: "talk",
      source_url: SAREE_DOCTOR_URL
    },
    llm: {
      provider: "openai",
      model: "gpt-4o-mini",
      instructions: "You are a professional and empathetic Indian female doctor. Your name is Dr. Sharma. Your role is to explain surgical procedures to patients in a clear, simple way. Answer their questions about risks and benefits with patience. When you feel the patient understands, encourage them to click the 'Confirm Now' button. Be warm and culturally respectful."
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
    if (data.id) {
      console.log('-----------------------------------');
      console.log('SUCCESS! Agent Created.');
      console.log('AGENT_ID:', data.id);
      console.log('-----------------------------------');
    } else {
      console.error('Failed to create agent:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAgent();
