import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Validate session server-side
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Fetch chats from Supabase
    const chats = await ChatModel.findByUserId(userId);

    // Filter chats with at least one message
    const validChats = chats.filter(chat => 
      chat.messages && chat.messages.length > 0
    );

    // Remove duplicates efficiently using Map (keeps most recent due to sort)
    const uniqueChatsMap = new Map();
    
    for (const chat of validChats) {
      const firstMessage = chat.messages?.[0]?.text || '';
      const key = `${chat.title}-${firstMessage.substring(0, 50)}`;
      
      if (!uniqueChatsMap.has(key)) {
        uniqueChatsMap.set(key, chat);
      }
    }

    // Convert to response format (direct array, not wrapped)
    const uniqueChats = Array.from(uniqueChatsMap.values()).slice(0, 50);
    
    const response = uniqueChats.map((chat: any) => ({
      id: chat.id,
      title: chat.title || chat.messages[0]?.text.substring(0, 60) || 'New Chat',
      snippet: chat.messages[chat.messages.length - 1]?.text.substring(0, 120) || '',
      lastMessageAt: chat.updated_at || chat.created_at,
      messages: chat.messages || [],
    }));

    // Return direct array to match frontend expectations
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
