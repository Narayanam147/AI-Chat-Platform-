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
    const isPublic = body?.isPublic !== false; // default to true
    
    console.log('🔗 Share request received:', { chatId, expiresDays, isPublic });
    
    if (!chatId) return NextResponse.json({ error: 'Missing chat id' }, { status: 400 });

    // Check if chatId is temporary
    if (chatId.startsWith('temp-')) {
      console.log('⚠️ Attempted to share temporary chat:', chatId);
      return NextResponse.json({ 
        error: 'Cannot share temporary chat. Please save the chat first.' 
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const createdBy = session?.user?.email ?? null;
    console.log('👤 User:', createdBy || 'guest');

    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify that the chat exists in the database before creating a share link
    console.log('🔍 Checking if chat exists in database:', chatId);
    const { data: chatExists, error: chatCheckError } = await supabaseAdmin
      .from('chats')
      .select('id, user_id, guest_session_id')
      .eq('id', chatId)
      .single();

    console.log('📊 Chat check result:', { 
      found: !!chatExists, 
      error: chatCheckError?.message,
      data: chatExists 
    });

    if (chatCheckError || !chatExists) {
      console.error('❌ Chat not found in database:', { 
        chatId, 
        error: chatCheckError?.message,
        code: chatCheckError?.code,
        details: chatCheckError?.details 
      });
      return NextResponse.json({ 
        error: 'Chat not found. Please make sure the chat is saved before sharing.' 
      }, { status: 404 });
    }
    
    console.log('✅ Chat found, creating share link...');

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('chat_shares')
      .insert([{
        chat_id: chatId,
        token,
        created_by: createdBy,
        expires_at: expiresAt,
        is_public: isPublic,
        view_count: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create share:', error);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }

    // Return id and token; client will compose origin
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
