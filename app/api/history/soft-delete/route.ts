import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    if (!supabaseAdmin) {
      console.error('supabaseAdmin not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify ownership (if user_id is set) before performing admin soft-delete
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('chats')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const owner = existing.user_id;
    const requester = session.user.email;
    if (owner && owner !== requester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('chats')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Soft-delete failed:', error);
      return NextResponse.json({ error: 'Failed to soft-delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('POST /api/history/soft-delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
