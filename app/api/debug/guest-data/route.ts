import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Debug endpoint to view chats and chat_history for a guest session
 * GET /api/debug/guest-data?token=<guest_token>
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: 'Missing token parameter',
        usage: '/api/debug/guest-data?token=<your_guest_token>'
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Supabase admin not configured'
      }, { status: 500 });
    }

    // Get guest session ID
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('guest_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Guest session not found',
        token_preview: token.substring(0, 15) + '...'
      }, { status: 404 });
    }

    // Get chats for this guest
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('guest_session_id', session.id)
      .order('created_at', { ascending: false });

    // Get chat_history for this guest
    const { data: history, error: historyError } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('guest_session_id', session.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      guest_session: {
        id: session.id,
        token_preview: session.session_token?.substring(0, 15) + '...',
        chat_title: session.chat_title,
        created_at: session.created_at,
        last_activity: session.last_activity
      },
      chats: {
        count: chats?.length || 0,
        error: chatsError?.message,
        data: chats?.map(c => ({
          id: c.id,
          title: c.title,
          message_count: c.messages?.length || 0,
          created_at: c.created_at
        }))
      },
      chat_history: {
        count: history?.length || 0,
        error: historyError?.message,
        data: history?.map(h => ({
          id: h.id,
          chat_id: h.chat_id,
          title: h.title,
          prompt_preview: h.prompt?.substring(0, 50),
          created_at: h.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Debug guest-data error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
