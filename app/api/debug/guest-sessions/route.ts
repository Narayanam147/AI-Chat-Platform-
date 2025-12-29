import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Debug endpoint to view guest sessions in database
 * GET /api/debug/guest-sessions
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Supabase admin not configured',
        hint: 'Check SUPABASE_SERVICE_ROLE_KEY in .env.local'
      }, { status: 500 });
    }

    // Query all guest sessions
    const { data: sessions, error, count } = await supabaseAdmin
      .from('guest_sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: count,
      sessions: sessions?.map(s => ({
        id: s.id,
        token_preview: s.session_token?.substring(0, 15) + '...',
        chat_title: s.chat_title,
        user_agent: s.user_agent?.substring(0, 50),
        created_at: s.created_at,
        expires_at: s.expires_at,
        last_activity: s.last_activity
      }))
    });

  } catch (error) {
    console.error('Debug guest-sessions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
