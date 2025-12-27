import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const url = new URL(request.url);
    const token = url.searchParams.get('t');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Use supabaseAdmin for better access
    const supabaseClient = supabaseAdmin || supabase;

    // Validate share entry and expiry
    const { data: share, error: shareErr } = await supabaseClient
      .from('chat_shares')
      .select('*')
      .eq('id', id)
      .eq('token', token)
      .single();

    if (shareErr || !share) {
      return NextResponse.json({ error: 'Not found or invalid token' }, { status: 404 });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link expired' }, { status: 410 });
    }

    // Increment view count
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('chat_shares')
        .update({ view_count: (share.view_count || 0) + 1 })
        .eq('id', id);
    }

    // Fetch the actual chat from chats table
    const { data: chat, error: chatErr } = await supabaseClient
      .from('chats')
      .select('*')
      .eq('id', share.chat_id)
      .single();

    if (chatErr || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Return the full chat with messages
    const payload = {
      id: chat.id,
      title: chat.title || 'Shared Chat',
      messages: chat.messages || [],
      created_at: chat.created_at,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (err) {
    console.error('GET /api/share/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
