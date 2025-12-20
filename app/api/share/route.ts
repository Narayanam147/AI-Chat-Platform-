import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chatId = body?.id;
    const expiresDays = Number(body?.expiresDays ?? 7);
    if (!chatId) return NextResponse.json({ error: 'Missing chat id' }, { status: 400 });

    const session = await getServerSession(authOptions);
    const createdBy = session?.user?.email ?? null;

    if (!supabaseAdmin) {
      console.error('supabaseAdmin not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('chat_shares')
      .insert([{
        chat_id: chatId,
        token,
        created_by: createdBy,
        expires_at: expiresAt,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create share:', error);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }

    // Return id and token; client will compose origin
    return NextResponse.json({ id: data.id, token, expires_at: data.expires_at });
  } catch (err) {
    console.error('POST /api/share error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
