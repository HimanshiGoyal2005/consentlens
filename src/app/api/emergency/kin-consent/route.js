import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      surgery_id, 
      patient_name, 
      patient_id, 
      bed_number, 
      language, 
      doctor_id,
      emergency_reason,
      kin_name,
      kin_phone,
      kin_relation
    } = body;

    // Validate required fields
    if (!surgery_id || !patient_name || !language || !emergency_reason || !kin_name) {
      return NextResponse.json(
        { error: 'Missing required fields for emergency consent' },
        { status: 400 }
      );
    }

    // Insert consent session with status 'ready' and consent_actor='kin'
    const { data: session, error: insertError } = await supabaseAdmin
      .from('consent_sessions')
      .insert({
        patient_id,
        patient_name,
        bed_number: bed_number || null,
        surgery_id,
        doctor_id: doctor_id || null,
        language,
        status: 'ready', // Immediately ready for WebRTC
        consent_actor: 'kin',
        emergency_reason,
        kin_name,
        kin_phone,
        kin_relation
      })
      .select('session_id')
      .single();

    if (insertError) {
      throw new Error(`Failed to create emergency session: ${insertError.message}`);
    }

    console.log(`[Emergency] Kin session created: ${session.session_id}`);

    return NextResponse.json({ session_id: session.session_id, status: 'ready' });
  } catch (error) {
    console.error('[Emergency] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
