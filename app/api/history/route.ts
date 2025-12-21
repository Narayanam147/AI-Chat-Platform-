import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;

    if (!userId) {
      console.log('No user session, returning empty array');
      return NextResponse.json([]);
    }

    console.log('Fetching chat_history for userId:', userId);

    // Fetch chat_history using the ChatModel
    const chats = await ChatModel.findByUserId(userId);
    
    console.log('Fetched chat_history:', chats.length, 'entries');

    // Transform to expected format for frontend
    const response = chats.map((chat: any) => {
      return {
        id: chat.id,
        title: chat.title || chat.prompt.substring(0, 50) + '...',
        snippet: chat.response.substring(0, 120) + (chat.response.length > 120 ? '...' : ''),
        lastMessageAt: chat.updated_at || chat.created_at,
        messages: [
          { text: chat.prompt, sender: 'user', timestamp: chat.created_at },
          { text: chat.response, sender: 'ai', timestamp: chat.created_at }
        ],
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
