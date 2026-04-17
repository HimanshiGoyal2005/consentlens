import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, doctor_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required field: session_id' },
        { status: 400 }
      );
    }

    const approved_at = new Date().toISOString();

    // Step 1: Update session to approved
    // Note: emergency fields (kin_name, etc.) are already in the session row
    const { error: updateError } = await supabaseAdmin
      .from('consent_sessions')
      .update({
        status: 'approved',
        approved_at,
        ...(doctor_id ? { doctor_id } : {}),
      })
      .eq('session_id', session_id);

    if (updateError) {
      throw new Error(`Failed to approve session: ${updateError.message}`);
    }

    // Step 2: Broadcast to OT (operating theatre) realtime channel
    try {
      const channel = supabaseAdmin.channel('ot-updates');
      await channel.send({
        type: 'broadcast',
        event: 'consent_approved',
        payload: {
          type: 'consent_approved',
          session_id,
          approved_at,
        },
      });
      console.log(`[Approve] OT broadcast sent for session ${session_id}`);
    } catch (broadcastError) {
      // Non-fatal — approval is recorded even if broadcast fails
      console.error('[Approve] OT broadcast failed:', broadcastError.message);
    }

    console.log(`[Approve] Session ${session_id} approved by ${doctor_id || 'unknown'}`);

    return NextResponse.json({ success: true, approved_at });
  } catch (error) {
    console.error('[Approve] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
