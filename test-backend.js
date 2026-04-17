// Test script to hit the local ConsentLens API endpoints
// Run this with: node test-backend.js
// Make sure your dev server is running on http://localhost:3000

const API_BASE = 'http://localhost:3000/api/consent';

async function runTests() {
  console.log('🧪 Starting ConsentLens Backend Tests...\n');

  try {
    // 1. Test Generate Route
    console.log('1️⃣ POST /generate (Creates session, generates risk bullets + video)');
    const generateRes = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgery_id: 'appendix_lap',
        patient_id: 'TEST001',
        patient_name: 'Test Patient',
        bed_number: '12',
        language: 'hindi',
        doctor_id: 'DR001'
      })
    });
    
    const generateData = await generateRes.json();
    console.log('Response:', generateData);
    
    if (!generateData.session_id) {
      console.log('❌ Generation failed. Check your .env API keys!');
      return;
    }
    
    const sessionId = generateData.session_id;
    console.log(`✅ Session Created: ${sessionId}\n`);

    // 2. Test Session GET Route
    console.log(`2️⃣ GET /session/${sessionId} (Fetches session + logs)`);
    const sessionRes = await fetch(`${API_BASE}/session/${sessionId}`);
    const sessionData = await sessionRes.json();
    console.log(`Response: Status = ${sessionData.session?.status}, Surgery = ${sessionData.surgery_name}\n`);

    // 3. Test Response Route (Understood)
    console.log('3️⃣ POST /response (Logs "understood" tap)');
    const responseRes = await fetch(`${API_BASE}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        risk_index: 0,
        response_type: 'understood'
      })
    });
    const responseData = await responseRes.json();
    console.log(`Response: New Score = ${responseData.comprehension_score}\n`);

    // 4. Test Complete Route
    console.log('4️⃣ POST /complete (Marks completed, notifies doctor)');
    const completeRes = await fetch(`${API_BASE}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    const completeData = await completeRes.json();
    console.log('Response:', completeData, '\n');

    // 5. Test Approve Route
    console.log('5️⃣ POST /approve (Doctor approves consent)');
    const approveRes = await fetch(`${API_BASE}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, doctor_id: 'DR001' })
    });
    const approveData = await approveRes.json();
    console.log('Response:', approveData, '\n');

    console.log('🎉 All tests completed!');

  } catch (err) {
    console.error('❌ Test script failed:', err.message);
  }
}

runTests();
