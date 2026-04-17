const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://edamqdqlfscmgxwjdvsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYW1xZHFsZnNjbWd4d2pkdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQxMjkwNSwiZXhwIjoyMDkxOTg4OTA1fQ.vQ4kmBsWwkudmL8ElBtT-s0PpFzgJawVTtobJYfCe34';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const IMAGE_PATH = 'C:/Users/srish/.gemini/antigravity/brain/2627c339-be28-446f-a97c-801a82b917b9/indian_saree_doctor_avatar_1776445750149.png';

async function uploadAvatar() {
  console.log('Uploading avatar image to Supabase...');
  const fileBuffer = fs.readFileSync(IMAGE_PATH);

  const { data, error } = await supabase.storage
    .from('consent-videos')
    .upload('avatars/saree_doctor.png', fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error.message);
  } else {
    const { data: urlData } = supabase.storage
      .from('consent-videos')
      .getPublicUrl('avatars/saree_doctor.png');
    console.log('Public URL:', urlData.publicUrl);
  }
}

uploadAvatar();
