import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const session_id = formData.get('session_id');
    const type = formData.get('type') || 'confirmation';

    if (!audio || !session_id) {
      return NextResponse.json({ error: 'Missing audio or session_id' }, { status: 400 });
    }

    // 1. Convert blob to Buffer
    const arrayBuf = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // 2. GENERATE CRYPTOGRAPHIC HASH (C2PA Legal Shield)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    console.log(`[Legal Shield] SHA-256 for ${session_id}: ${hash}`);

    const fileName = `${type}_${session_id}_${Date.now()}.webm`;

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('consent-videos')
      .upload(`${type}s/${fileName}`, buffer, {
        contentType: 'video/webm',
        upsert: false
      });

    if (uploadError) {
      console.error(`[Voice Save] Upload error:`, uploadError.message);
      throw uploadError;
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/consent-videos/${type}s/${fileName}`;

    // 4. Update DB only for real (non-mock) sessions
    const isMockSession = session_id.startsWith('sess_');
    if (!isMockSession) {
      const updateData = { c2pa_hash: hash };
      if (type === 'audit') {
        updateData.status = 'confirming';
      } else {
        updateData.pdf_url = publicUrl;
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabaseAdmin
        .from('consent_sessions')
        .update(updateData)
        .eq('session_id', session_id);

      if (updateError) {
        console.error('[Voice Save] DB update error:', updateError.message);
        // Don't throw — file is already saved, just log the DB error
      }
    } else {
      console.log(`[Voice Save] Mock session ${session_id} — skipping DB update, file saved OK.`);
    }

    return NextResponse.json({ success: true, url: publicUrl, hash });

  } catch (error) {
    console.error('[Voice Save] Critical Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
