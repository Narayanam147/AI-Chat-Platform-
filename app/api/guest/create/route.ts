import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Create a new guest session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🆕 Creating new guest session...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    console.log('🔑 Generated token:', sessionToken.substring(0, 10) + '...');

    // Create guest session in database
    const { data, error } = await supabaseAdmin
      .from('guest_sessions')
      .insert([{
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        user_agent: request.headers.get('user-agent') || 'Unknown',
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create guest session:', error);
      return NextResponse.json({ error: 'Failed to create guest session' }, { status: 500 });
    }

    console.log('✅ Guest session created:', data.id);

    return NextResponse.json({ 
      token: data.session_token, 
      id: data.id,
      expires_at: data.expires_at 
    });

  } catch (error) {
    console.error('POST /api/guest/create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
