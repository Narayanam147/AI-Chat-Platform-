import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: chat, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const safe = {
      id: chat.id,
      title: chat.title || chat.prompt?.substring(0, 60) || 'Chat',
      messages: [
        { text: chat.prompt, sender: 'user', timestamp: chat.created_at },
        { text: chat.response, sender: 'ai', timestamp: chat.created_at },
      ],
      created_at: chat.created_at,
    };

    return NextResponse.json(safe);
  } catch (error) {
    console.error('GET /api/history/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Import supabase here to update chat_history
    const { supabase } = await import('@/lib/supabase');

    // Verify chat belongs to user
    const { data: chat, error: fetchError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError || !chat) {
      console.error('Chat not found:', fetchError);
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    if (chat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: any = {};
    
    // Only update allowed fields
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.pinned !== 'undefined') updates.pinned = Boolean(body.pinned);
    if (typeof body.is_deleted !== 'undefined') {
      updates.is_deleted = Boolean(body.is_deleted);
      updates.deleted_at = body.is_deleted ? new Date().toISOString() : null;
    }

    // Update chat_history
    const { data: updated, error: updateError } = await supabase
      .from('chat_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Update failed:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/history/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: chat, error: fetchError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (chat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('chat_history')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Delete error:', updateError);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('DELETE /api/history/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
