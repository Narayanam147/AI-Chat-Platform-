import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;

    if (!userId) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat_history:', error);
      return NextResponse.json([]);
    }

    const response = (data || []).map((chat: any) => ({
      id: chat.id,
      title: chat.title || chat.prompt?.substring(0, 60) || 'New Chat',
      snippet: chat.response?.substring(0, 120) || '',
      lastMessageAt: chat.created_at,
      messages: [
        { text: chat.prompt, sender: 'user', timestamp: chat.created_at },
        { text: chat.response, sender: 'ai', timestamp: chat.created_at },
      ],
      pinned: chat.pinned || false,
    }));

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
