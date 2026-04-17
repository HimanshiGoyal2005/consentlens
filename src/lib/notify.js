import { supabaseAdmin } from '@/lib/supabase';

/**
 * Mock WhatsApp notification to doctor + Supabase Realtime broadcast.
 * Returns { mocked: true, message: string }
 */
export async function notifyDoctor(sessionData) {
  const {
    session_id,
    patient_name,
    bed_number,
    comprehension_score,
    language,
  } = sessionData;

  const message = `📱 [MOCK WhatsApp] → Doctor: Bed ${bed_number} — ${patient_name} understood ${comprehension_score}/5 risks in ${language}. Ready for your 2-minute consultation and signature.`;

  console.log(message);

  // Broadcast via Supabase Realtime
  try {
    const channel = supabaseAdmin.channel('doctor-notifications');
    await channel.send({
      type: 'broadcast',
      event: 'consent_complete',
      payload: {
        type: 'consent_complete',
        session_id,
        patient_name,
        bed_number,
        comprehension_score,
        language,
      },
    });
    console.log('[Notify] Realtime broadcast sent to doctor-notifications');
  } catch (error) {
    console.error('[Notify] Realtime broadcast failed:', error.message);
  }

  return { mocked: true, message };
}

/**
 * Mock push notification to nursing station + Supabase Realtime broadcast.
 */
export async function notifyNursingStation(sessionId, riskIndex) {
  const message = `🚨 [MOCK Push] → Nursing Station: Patient needs help with risk #${riskIndex} in session ${sessionId}`;

  console.log(message);

  try {
    const channel = supabaseAdmin.channel('nursing-station');
    await channel.send({
      type: 'broadcast',
      event: 'nurse_flag',
      payload: {
        type: 'nurse_flag',
        session_id: sessionId,
        risk_index: riskIndex,
      },
    });
    console.log('[Notify] Realtime broadcast sent to nursing-station');
  } catch (error) {
    console.error('[Notify] Nursing station broadcast failed:', error.message);
  }
}
