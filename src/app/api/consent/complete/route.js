import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyDoctor } from '@/lib/notify';

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required field: session_id' },
        { status: 400 }
      );
    }

    // Step 1: Update session status to 'completed'
    const { error: updateError } = await supabaseAdmin
      .from('consent_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('session_id', session_id);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    // Step 2: Fetch full session data for notification
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('consent_sessions')
      .select('session_id, patient_name, bed_number, language, comprehension_score')
      .eq('session_id', session_id)
      .single();

    if (fetchError || !sessionData) {
      throw new Error(`Failed to fetch session: ${fetchError?.message}`);
    }

    // Step 3: Notify doctor (mock WhatsApp + Realtime)
    await notifyDoctor(sessionData);

    console.log(`[Complete] Session ${session_id} marked complete — doctor notified`);

    return NextResponse.json({ success: true, whatsapp_mocked: true });
  } catch (error) {
    console.error('[Complete] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
