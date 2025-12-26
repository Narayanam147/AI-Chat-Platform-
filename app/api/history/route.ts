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
