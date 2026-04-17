import { ElevenLabsClient } from 'elevenlabs';
import { supabaseAdmin } from '@/lib/supabase';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

/**
 * Generate Bhojpuri TTS audio and upload to Supabase Storage.
 * Returns the public URL of the uploaded MP3 file.
 */
export async function generateBhojpuriAudio(text, sessionId) {
  try {
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

    // Collect stream chunks into a single Buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Upload to Supabase Storage
    const storagePath = `audio/${sessionId}.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('consent-videos')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('consent-videos')
      .getPublicUrl(storagePath);

    console.log(`[ElevenLabs] Audio uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[ElevenLabs] TTS generation failed:', error.message);
    throw new Error(`ElevenLabs TTS failed: ${error.message}`);
  }
}
