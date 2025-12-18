import { NextRequest, NextResponse } from 'next/server';
import { ChatModel } from '@/models/Chat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const chat = await ChatModel.findById(id);
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Public GET: return chat messages but redact sensitive fields
    const safe = {
      id: chat.id,
      title: chat.title || chat.messages?.[0]?.text?.substring(0, 60) || 'Chat',
      messages: chat.messages || [],
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      owner: chat.user_id ? undefined : undefined, // do not expose owner
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

    // Verify chat belongs to user
    const chat = await ChatModel.findById(id);
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (chat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: any = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.pinned !== 'undefined') updates.pinned = body.pinned;

    const updated = await ChatModel.update(id, updates);
    if (!updated) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });

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

    // Verify chat belongs to user
    const chat = await ChatModel.findById(id);
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (chat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the chat
    const success = await ChatModel.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/history/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
