import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getChatResponse } from '@/lib/gemini';
import { getSurgeryConfig } from '@/lib/surgeryConfigs';

export async function POST(request) {
  try {
    const { session_id, message } = await request.json();

    if (!session_id || !message) {
      return NextResponse.json({ error: 'Missing session_id or message' }, { status: 400 });
    }

    // 1. Fetch session context
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('consent_sessions')
      .select('*, surgeries(name, risks_json)')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Prepare context for Gemini
    const surgeryId = session.surgery_id;
    const config = getSurgeryConfig(surgeryId);
    
    const context = {
      surgeryName: session.surgeries?.name || config.name,
      risks: session.surgeries?.risks_json || config.risks.map(r => r.title),
      benefits: config.benefits
    };

    // 3. Get AI Response
    const aiResponse = await getChatResponse(message, context, session.language);

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error('[Chat API] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
