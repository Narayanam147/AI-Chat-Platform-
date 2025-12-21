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

    // Return chat with messages in expected format
    const safe = {
      id: chat.id,
      title: chat.title || chat.prompt.substring(0, 60),
      messages: [
        { text: chat.prompt, sender: 'user', timestamp: chat.created_at },
        { text: chat.response, sender: 'ai', timestamp: chat.created_at }
      ],
      created_at: chat.created_at,
      updated_at: chat.updated_at,
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
    if (typeof body.is_deleted !== 'undefined') {
      updates.is_deleted = Boolean(body.is_deleted);
      updates.deleted_at = body.is_deleted ? new Date().toISOString() : null;
    }

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

    // Soft-delete: mark chat as deleted instead of removing from DB
    const success = await ChatModel.softDelete(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/history/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
