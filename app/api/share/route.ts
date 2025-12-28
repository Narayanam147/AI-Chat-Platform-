import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body?.messages; // Accept messages directly
    const title = body?.title || 'Shared Chat';
    const expiresDays = Number(body?.expiresDays ?? 30);
    const isPublic = body?.isPublic !== false;
    
    console.log('🔗 Share request received:', { 
      body: JSON.stringify(body),
      hasMessages: !!messages, 
      messageCount: messages?.length,
      isArray: Array.isArray(messages),
      messagesType: typeof messages,
      title,
      expiresDays 
    });

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Message validation failed:', {
        hasMessages: !!messages,
        isArray: Array.isArray(messages),
        length: messages?.length,
        messagesValue: messages
      });
      return NextResponse.json({ 
        error: 'No messages to share. Please send at least one message first.' 
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const createdBy = session?.user?.email ?? null;
    console.log('👤 User:', createdBy || 'guest');

    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    // Store the shared chat with embedded messages (snapshot approach)
    const { data, error } = await supabaseAdmin
      .from('chat_shares')
      .insert([{
        token,
        title,
        messages, // Store messages directly in the share
        created_by: createdBy,
        expires_at: expiresAt,
        is_public: isPublic,
        view_count: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create share:', error);
      return NextResponse.json({ error: 'Failed to create share: ' + error.message }, { status: 500 });
    }

    console.log('✅ Share created successfully:', data.id);

    return NextResponse.json({ 
      id: data.id, 
      token, 
      expires_at: data.expires_at,
      is_public: data.is_public 
    });
  } catch (err) {
    console.error('POST /api/share error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
