import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRiskBullets } from '@/lib/gemini';
import { generateAvatarVideo } from '@/lib/did';

export async function POST(request) {
  let sessionId = null;

  try {
    const body = await request.json();
    const { surgery_id, patient_id, patient_name, bed_number, language, kin_phone, doctor_id } = body;

    // Step 1: Validate required fields
    if (!surgery_id || !patient_id || !patient_name || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: surgery_id, patient_id, patient_name, language' },
        { status: 400 }
      );
    }

    // Step 2: Fetch surgery
    const { data: surgery, error: surgeryError } = await supabaseAdmin
      .from('surgeries')
      .select('*')
      .eq('id', surgery_id)
      .single();

    if (surgeryError || !surgery) {
      return NextResponse.json(
        { error: `Surgery not found: ${surgery_id}` },
        { status: 404 }
      );
    }

    // Step 3: Insert consent session with status 'generating'
    const { data: sessionRow, error: insertError } = await supabaseAdmin
      .from('consent_sessions')
      .insert({
        patient_id,
        patient_name,
        bed_number: bed_number || null,
        surgery_id,
        doctor_id: doctor_id || null,
        language,
        status: 'generating',
      })
      .select('session_id')
      .single();

    if (insertError) {
      throw new Error(`Failed to create session: ${insertError.message}`);
    }

    sessionId = sessionRow.session_id;
    console.log(`[Generate] Session created: ${sessionId}`);

    // Step 4: Generate risk bullets via Gemini (with timeout)
    let bulletResult;
    try {
      const geminiPromise = generateRiskBullets(surgery.name, surgery.risks_json, language);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timed out after 30s')), 30000)
      );
      bulletResult = await Promise.race([geminiPromise, timeoutPromise]);
    } catch (geminiError) {
      console.error('[Generate] Gemini error:', geminiError.message);
      throw geminiError;
    }
    
    const bullets = bulletResult.bullets;

    // Step 5: Join bullets into script string
    const scriptText = bullets.join('. ');

    // Step 6: Generate avatar video via D-ID
    let video_url = await generateAvatarVideo(scriptText, sessionId, language);

    if (!video_url) {
      console.warn(`[Generate] D-ID returned null for session ${sessionId} — using fallback`);
      video_url = '/fallback-video.mp4';
    }

    // Step 7: Update session with video_url and status 'ready'
    const { error: updateError } = await supabaseAdmin
      .from('consent_sessions')
      .update({ video_url, status: 'ready' })
      .eq('session_id', sessionId);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    console.log(`[Generate] Session ${sessionId} ready — video: ${video_url}`);

    // Step 8: Return session info
    return NextResponse.json({ session_id: sessionId, video_url, status: 'ready' });
  } catch (error) {
    console.error('[Generate] Pipeline error:', error.message);

    // Attempt to mark session as failed (best-effort)
    if (sessionId) {
      try {
        await supabaseAdmin
          .from('consent_sessions')
          .update({ status: 'failed' })
          .eq('session_id', sessionId);
      } catch (updateError) {
        console.error('[Generate] Failed to update session status:', updateError.message);
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
