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

    // Validate share entry and expiry - messages are now embedded in share
    const { data: share, error: shareErr } = await supabaseClient
      .from('chat_shares')
      .select('*')
      .eq('id', id)
      .eq('token', token)
      .single();

    if (shareErr || !share) {
      console.log('❌ Share not found:', { id, shareErr });
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

    // Messages are now embedded directly in chat_shares (snapshot approach)
    const payload = {
      id: share.id,
      title: share.title || 'Shared Chat',
      messages: share.messages || [],
      created_at: share.created_at,
    };

    console.log('✅ Share retrieved:', { id: share.id, messageCount: payload.messages.length });

    return NextResponse.json({ success: true, data: payload });
  } catch (err) {
    console.error('GET /api/share/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
