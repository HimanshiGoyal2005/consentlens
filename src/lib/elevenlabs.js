import { ElevenLabsClient } from 'elevenlabs';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

/**
 * Generate Bhojpuri TTS audio with S3/Supabase caching.
 * Uses MD5 hash of the text as the cache key.
 */
export async function generateBhojpuriAudio(text, sessionId) {
  try {
    // Step 1: Generate cache key based on text
    const textHash = crypto.createHash('md5').update(text).digest('hex');
    const cachePath = `audio/cache/${textHash}.mp3`;
    const sessionPath = `audio/sessions/${sessionId}_${textHash.slice(0, 8)}.mp3`;

    // Step 2: Check if file already exists in cache
    const { data: existingFiles } = await supabaseAdmin.storage
      .from('consent-videos')
      .list('audio/cache', {
        search: `${textHash}.mp3`,
      });

    const isCached = existingFiles && existingFiles.length > 0;

    if (isCached) {
      console.log(`[ElevenLabs] Cache HIT: ${textHash}`);
      const { data: urlData } = supabaseAdmin.storage
        .from('consent-videos')
        .getPublicUrl(cachePath);
      return urlData.publicUrl;
    }

    console.log(`[ElevenLabs] Cache MISS. Generating audio...`);

    // Step 3: Generate new audio from ElevenLabs
    const audioStream = await client.textToSpeech.convert(
      'JBFqnCBsd6RMkjVDRZzb', // Voice ID — George (multilingual)
      {
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }
    );

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Step 4: Upload to Cache and Session-specific path
    await supabaseAdmin.storage
      .from('consent-videos')
      .upload(cachePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    // Also copy to session path for logging/audit tracking
    const { error: uploadError } = await supabaseAdmin.storage
      .from('consent-videos')
      .upload(sessionPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[ElevenLabs] Warning: Failed to save session-specific copy: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('consent-videos')
      .getPublicUrl(cachePath);

    console.log(`[ElevenLabs] Audio generated and cached: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[ElevenLabs] TTS generation failed:', error.message);
    throw new Error(`ElevenLabs TTS failed: ${error.message}`);
  }
}
