import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;

    // Check for guest token in query params or headers
    const url = new URL(request.url);
    const guestToken = url.searchParams.get('guestToken') || request.headers.get('x-guest-token');

    let chats: any[] = [];

    if (userId) {
      // Authenticated user - fetch their chats
      console.log('Fetching chats for userId:', userId);
      chats = await ChatModel.findByUserId(userId);
    } else if (guestToken && supabaseAdmin) {
      // Guest user - fetch their chats
      console.log('Fetching chats for guest token');
      
      const { data: guestSession } = await supabaseAdmin
        .from('guest_sessions')
        .select('id')
        .eq('session_token', guestToken)
        .single();

      if (guestSession) {
        chats = await ChatModel.findByGuestSession(guestSession.id);
        console.log('Fetched guest chats:', chats.length, 'chats');
      }
    } else {
      console.log('No user session or guest token, returning empty array');
      return NextResponse.json([]);
    }
    
    console.log('Fetched chats:', chats.length, 'chats');

    // Transform to expected format for frontend
    const response = chats.map((chat: any) => {
      const messages = chat.messages || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const firstMessage = messages.length > 0 ? messages[0] : null;
      
      return {
        id: chat.id,
        title: chat.title || (firstMessage?.text?.substring(0, 50) + '...') || 'New Chat',
        snippet: lastMessage?.text?.substring(0, 120) || '',
        lastMessageAt: chat.updated_at || chat.created_at,
        messages: messages,
        pinned: chat.pinned || false,
      };
    });

    console.log('Returning', response.length, 'formatted chats');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;
    
    const body = await request.json();
    const { user_id, guest_session_id, messages, title } = body;

    console.log('📝 POST /api/history - Creating chat:', { 
      user_id, 
      guest_session_id: guest_session_id ? 'provided' : 'none', 
      messageCount: messages?.length 
    });

    // Determine which ID to use
    const effectiveUserId = user_id || userId;
    
    // Validate we have either a user or guest session
    if (!effectiveUserId && !guest_session_id) {
      console.error('❌ No user ID or guest session ID provided');
      return NextResponse.json(
        { error: 'User ID or guest session ID required' },
        { status: 400 }
      );
    }

    // For guest sessions, check if it's a token or ID and convert if needed
    let guestSessionIdToUse = null;
    if (guest_session_id && !effectiveUserId && supabaseAdmin) {
      // Check if it's a UUID (database ID) or a token
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guest_session_id);
      
      if (isUUID) {
        // Already a database ID
        guestSessionIdToUse = guest_session_id;
      } else {
        // It's a token, look up the ID
        const { data: guestSession, error: guestError } = await supabaseAdmin
          .from('guest_sessions')
          .select('id')
          .eq('session_token', guest_session_id)
          .single();
        
        if (guestError || !guestSession) {
          console.error('❌ Guest session not found:', guestError);
          return NextResponse.json(
            { error: 'Invalid guest session' },
            { status: 400 }
          );
        }
        guestSessionIdToUse = guestSession.id;
      }
    }

    // Create the chat
    const chat = await ChatModel.create({
      user_id: effectiveUserId,
      guest_session_id: guestSessionIdToUse,
      messages: messages || [],
      title: title || 'New Chat',
    });

    if (!chat) {
      console.error('❌ ChatModel.create returned null');
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      );
    }

    console.log('✅ Chat created successfully:', chat.id, 'with', messages?.length || 0, 'messages');

    return NextResponse.json({
      success: true,
      data: {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        created_at: chat.created_at,
      }
    });

  } catch (error) {
    console.error('❌ POST History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
