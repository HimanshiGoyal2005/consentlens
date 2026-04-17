import { supabaseAdmin } from '@/lib/supabase';

const DID_API_URL = 'https://api.d-id.com';

function getAuthHeader() {
  const key = process.env.DID_API_KEY;
  const encoded = Buffer.from(`${key}:`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Sleep helper for polling
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate an avatar video using D-ID Talks (Standard V3).
 * Uses native Microsoft voices to ensure reliability and bypass external key issues.
 */
export async function generateAvatarVideo(scriptText, sessionId, language = 'Hindi') {
  try {
    const SAREE_DOCTOR_URL = "https://edamqdqlfscmgxwjdvsa.supabase.co/storage/v1/object/public/consent-videos/avatars/saree_doctor.png";

    // Language to Microsoft Voice Mapping
    const voiceMap = {
      'Hindi': 'hi-IN-SwaraNeural',
      'Marathi': 'mr-IN-AarohiNeural',
      'Bhojpuri': 'hi-IN-MadhurNeural', // Fallback to clear Hindi
      'Awadhi': 'hi-IN-SwaraNeural',
      'Maithili': 'hi-IN-SwaraNeural',
      'English': 'en-IN-NeerjaNeural'
    };

    const selectedVoice = voiceMap[language] || 'hi-IN-SwaraNeural';

    // Step 1: Create Talk
    console.log(`[D-ID] Creating talk video with Saree Doctor & Microsoft Voice (${selectedVoice})...`);
    const createRes = await fetch(`${DID_API_URL}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: SAREE_DOCTOR_URL,
        script: {
          type: 'text',
          input: scriptText,
          provider: {
            type: 'microsoft',
            voice_id: selectedVoice,
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.5
        }
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error('[D-ID] Create failed:', createRes.status, errBody);
      return null;
    }

    const createData = await createRes.json();
    const talkId = createData.id;
    console.log(`[D-ID] Talk created: ${talkId}`);

    // Step 2: Poll for completion — every 3s, max 20 attempts (60 seconds)
    let resultUrl = null;
    for (let attempt = 1; attempt <= 20; attempt++) {
      await sleep(3000);

      const pollRes = await fetch(`${DID_API_URL}/talks/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!pollRes.ok) {
        console.error('[D-ID] Poll failed:', pollRes.status);
        continue;
      }

      const pollData = await pollRes.json();
      console.log(`[D-ID] Poll attempt ${attempt}/20 — status: ${pollData.status}`);

      if (pollData.status === 'done') {
        resultUrl = pollData.result_url;
        break;
      }

      if (pollData.status === 'error' || pollData.status === 'rejected') {
        console.error('[D-ID] Video generation failed with status:', pollData.status);
        if (pollData.error) console.error('[D-ID] Error Detail:', pollData.error);
        return null;
      }
    }

    if (!resultUrl) {
      console.warn('[D-ID] Timed out waiting for video completion — using fallback');
      return null;
    }

    // Step 3: Download the video
    console.log('[D-ID] Downloading generated video...');
    const videoRes = await fetch(resultUrl);
    if (!videoRes.ok) {
      console.error('[D-ID] Video download failed:', videoRes.status);
      return null;
    }

    const videoArrayBuffer = await videoRes.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);

    // Step 4: Upload to Supabase Storage
    const storagePath = `videos/${sessionId}.mp4`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('consent-videos')
      .upload(storagePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      console.error('[D-ID] Supabase upload failed:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('consent-videos')
      .getPublicUrl(storagePath);

    console.log(`[D-ID] Video uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[D-ID] Unexpected error:', error.message);
    return null;
  }
}
