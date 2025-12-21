import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Determine user context: logged-in users use their email as user_id;
    // guests will receive rows where user_id IS NULL.
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?? null;

    // Fetch chat_history entries (visible only where is_deleted = false).
    const supabase = (await import('@/lib/supabase')).supabase;
    let query: any = supabase.from('chat_history').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
    if (userId == null) {
      query = query.is('user_id', null);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch chat_history rows:', error);
      return NextResponse.json([], { status: 200 });
    }

    const chats = data || [];

    // Map chat_history rows into the frontend chat shape
    const response = chats.map((row: any) => ({
      id: row.id,
      title: (row.prompt && String(row.prompt).substring(0, 60)) || 'New Chat',
      snippet: (row.response && String(row.response).substring(0, 120)) || '',
      lastMessageAt: row.created_at,
      messages: [
        { text: row.prompt, sender: 'user', timestamp: row.created_at },
        { text: row.response, sender: 'ai', timestamp: row.created_at },
      ],
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
