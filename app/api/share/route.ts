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
      console.error('❌ supabaseAdmin not configured - SUPABASE_SERVICE_ROLE_KEY may be missing');
      return NextResponse.json({ 
        error: 'Server misconfiguration: Database admin client not available',
        hint: 'Check SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    // Validate and prepare messages
    if (!Array.isArray(messages)) {
      console.error('❌ Messages is not an array:', typeof messages);
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }
    
    // Ensure each message has required fields
    const cleanMessages = messages.map((m: any, i: number) => ({
      text: String(m.text || ''),
      sender: String(m.sender || 'user'),
      timestamp: String(m.timestamp || new Date().toISOString())
    }));
    
    console.log('📝 Inserting share with:', {
      token: token.substring(0, 8) + '...',
      title,
      messageCount: cleanMessages.length,
      firstMessage: cleanMessages[0],
      messagesType: typeof cleanMessages,
      isArray: Array.isArray(cleanMessages),
      createdBy,
      expiresAt,
      isPublic
    });

    // Build the insert object explicitly
    const insertData = {
      token,
      title,
      messages: cleanMessages,
      created_by: createdBy,
      expires_at: expiresAt,
      is_public: isPublic,
      view_count: 0,
    };
    
    console.log('📦 Full insert data:', JSON.stringify(insertData, null, 2));

    // Store the shared chat with embedded messages (snapshot approach)
    const { data, error } = await supabaseAdmin
      .from('chat_shares')
      .insert([insertData])
      .select()
      .single();

    console.log('📊 Insert result:', {
      success: !error,
      dataId: data?.id,
      hasMessages: data?.messages ? 'yes' : 'no',
      messagesCount: data?.messages?.length || 0
    });

    if (error) {
      console.error('❌ Failed to create share:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: 'Failed to create share: ' + error.message,
        code: error.code,
        hint: error.hint 
      }, { status: 500 });
    }

    console.log('✅ Share created successfully:', data.id);

    return NextResponse.json({ 
      id: data.id, 
      token, 
      expires_at: data.expires_at,
      is_public: data.is_public 
    });
  } catch (err: any) {
    console.error('POST /api/share error:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    return NextResponse.json({ 
      error: 'Internal server error: ' + (err?.message || 'Unknown error')
    }, { status: 500 });
  }
}
