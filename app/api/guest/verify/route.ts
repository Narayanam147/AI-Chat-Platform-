import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Verify a guest session token is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Check if session exists and is not expired
    const { data, error } = await supabaseAdmin
      .from('guest_sessions')
      .select('*')
      .eq('session_token', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    // Update last activity
    await supabaseAdmin
      .from('guest_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', data.id);

    return NextResponse.json({ 
      valid: true, 
      id: data.id,
      expires_at: data.expires_at 
    });

  } catch (error) {
    console.error('POST /api/guest/verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
