import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyNursingStation } from '@/lib/notify';

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, risk_index, response_type } = body;

    if (!session_id || risk_index === undefined || !response_type) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, risk_index, response_type' },
        { status: 400 }
      );
    }

    if (!['understood', 'replay_requested'].includes(response_type)) {
      return NextResponse.json(
        { error: 'response_type must be "understood" or "replay_requested"' },
        { status: 400 }
      );
    }

    // Step 1: Insert comprehension log row
    const { error: logError } = await supabaseAdmin
      .from('comprehension_log')
      .insert({
        session_id,
        risk_index,
        response: response_type,
      });

    if (logError) {
      throw new Error(`Failed to insert log: ${logError.message}`);
    }

    // Step 2: Handle 'understood' — increment comprehension score
    if (response_type === 'understood') {
      const { data: currentSession, error: fetchErr } = await supabaseAdmin
        .from('consent_sessions')
        .select('comprehension_score')
        .eq('session_id', session_id)
        .single();

      if (fetchErr) throw new Error(`Failed to fetch session: ${fetchErr.message}`);

      const { error: updateErr } = await supabaseAdmin
        .from('consent_sessions')
        .update({ comprehension_score: (currentSession.comprehension_score || 0) + 1 })
        .eq('session_id', session_id);

      if (updateErr) throw new Error(`Failed to update score: ${updateErr.message}`);
    }

    // Step 3: Handle 'replay_requested' — check if nurse flag threshold reached
    if (response_type === 'replay_requested') {
      const { data: replayRows, error: countError } = await supabaseAdmin
        .from('comprehension_log')
        .select('id')
        .eq('session_id', session_id)
        .eq('risk_index', risk_index)
        .eq('response', 'replay_requested');

      if (countError) throw new Error(`Failed to count replays: ${countError.message}`);

      // If >= 2 replays on this risk, escalate to nurse
      if (replayRows && replayRows.length >= 2) {
        // Insert nurse_flagged log entry
        await supabaseAdmin
          .from('comprehension_log')
          .insert({
            session_id,
            risk_index,
            response: 'nurse_flagged',
          });

        // Notify nursing station (mock + realtime)
        await notifyNursingStation(session_id, risk_index);
        console.log(`[Response] Nurse flagged for session ${session_id}, risk #${risk_index}`);
      }
    }

    // Step 4: Fetch updated comprehension score
    const { data: updatedSession, error: fetchError } = await supabaseAdmin
      .from('consent_sessions')
      .select('comprehension_score')
      .eq('session_id', session_id)
      .single();

    if (fetchError) throw new Error(`Failed to fetch updated score: ${fetchError.message}`);

    return NextResponse.json({
      success: true,
      comprehension_score: updatedSession.comprehension_score,
    });
  } catch (error) {
    console.error('[Response] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
