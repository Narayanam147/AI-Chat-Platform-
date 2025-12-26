import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Migrate guest session chats to authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestToken, userEmail } = body;

    if (!guestToken || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Find guest session
    const { data: guestSession, error: sessionError } = await supabaseAdmin
      .from('guest_sessions')
      .select('id')
      .eq('session_token', guestToken)
      .single();

    if (sessionError || !guestSession) {
      return NextResponse.json({ error: 'Invalid guest session' }, { status: 404 });
    }

    // Find all chats associated with this guest session
    const { data: guestChats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('guest_session_id', guestSession.id);

    if (chatsError) {
      console.error('Failed to fetch guest chats:', chatsError);
      return NextResponse.json({ error: 'Failed to migrate chats' }, { status: 500 });
    }

    if (!guestChats || guestChats.length === 0) {
      // No chats to migrate, just delete the guest session
      await supabaseAdmin
        .from('guest_sessions')
        .delete()
        .eq('id', guestSession.id);
      
      return NextResponse.json({ migrated: 0 });
    }

    // Update all guest chats to belong to the authenticated user
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({
        user_id: userEmail,
        guest_session_id: null,
      })
      .eq('guest_session_id', guestSession.id);

    if (updateError) {
      console.error('Failed to migrate chats:', updateError);
      return NextResponse.json({ error: 'Failed to migrate chats' }, { status: 500 });
    }

    // Delete the guest session
    await supabaseAdmin
      .from('guest_sessions')
      .delete()
      .eq('id', guestSession.id);

    return NextResponse.json({ 
      success: true, 
      migrated: guestChats.length 
    });

  } catch (error) {
    console.error('POST /api/guest/migrate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
