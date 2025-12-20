import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const url = new URL(request.url);
    const token = url.searchParams.get('t');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Validate share entry and expiry
    const { data: share, error: shareErr } = await supabase
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

    // Fetch the chat_history row
    const { data: row, error: rowErr } = await supabase
      .from('chat_history')
      .select('*')
      .eq('id', share.chat_id)
      .single();

    if (rowErr || !row) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Return a sanitized payload: prompt, response, created_at
    const payload = {
      id: row.id,
      prompt: row.prompt,
      response: row.response,
      created_at: row.created_at,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (err) {
    console.error('GET /api/share/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
