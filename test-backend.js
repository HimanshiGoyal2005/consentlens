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

    // 2. Test Voice Caching (Hidden Internal Test)
    // Concept: hitting /generate twice with same text should be faster 2nd time.

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

    // 4. Test PDF Generation
    console.log(`4️⃣ GET /pdf/${sessionId} (Generates official document)`);
    const pdfRes = await fetch(`${API_BASE}/pdf/${sessionId}`);
    if (pdfRes.ok) {
      console.log('✅ PDF Generated successfully (Buffer received)');
    } else {
      console.log('❌ PDF Generation failed.');
    }

    // 5. Test Complete Route
    console.log('\n5️⃣ POST /complete (Marks completed, notifies doctor)');
    const completeRes = await fetch(`${API_BASE}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    const completeData = await completeRes.json();
    console.log('Response:', completeData, '\n');

    console.log('🎉 All backend flow tests completed!');

  } catch (err) {
    console.error('❌ Test script failed:', err.message);
  }
}

runTests();
