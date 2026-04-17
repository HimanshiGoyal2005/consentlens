import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { session_id } = await params;

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Step 1: Fetch consent session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('consent_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Step 2: Fetch related surgery name
    let surgery_name = null;
    if (session.surgery_id) {
      const { data: surgery } = await supabaseAdmin
        .from('surgeries')
        .select('name')
        .eq('id', session.surgery_id)
        .single();

      if (surgery) {
        surgery_name = surgery.name;
      }
    }

    // Step 3: Fetch all comprehension log rows for this session
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('comprehension_log')
      .select('*')
      .eq('session_id', session_id)
      .order('timestamp', { ascending: true });

    if (logsError) {
      console.error('[Session] Failed to fetch logs:', logsError.message);
    }

    return NextResponse.json({
      session,
      surgery_name,
      logs: logs || [],
    });
  } catch (error) {
    console.error('[Session] Unexpected error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
