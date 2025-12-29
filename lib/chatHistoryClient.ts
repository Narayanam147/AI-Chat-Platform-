import { supabase } from '@/lib/supabase';

export type HistoryEntry = {
  id?: string;
  user_id?: string | null; // email or null for guests
  guest_session_id?: string | null; // guest session ID for guest users
  prompt: string;
  response: string;
  is_deleted?: boolean;
  created_at?: string;
};

/** Save a history row when AI responds. `userId` may be null for guests. */
export async function saveHistoryEntry({ userId, guestSessionId, prompt, response }: { userId?: string | null; guestSessionId?: string | null; prompt: string; response: string; }) {
  try {
    const row = {
      user_id: userId ?? null,
      guest_session_id: guestSessionId ?? null,
      prompt,
      response,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('chat_history').insert([row]).select().single();
    if (error) throw error;
    return data as HistoryEntry;
  } catch (err) {
    console.error('saveHistoryEntry error', err);
    throw err;
  }
}

/** Fetch visible history for a user (email), guest session, or all guests (userId === null, guestSessionId === null). */
export async function fetchHistoryForUser(userId?: string | null, guestSessionId?: string | null) {
  try {
    let query: any = supabase.from('chat_history').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
    
    if (userId) {
      // Authenticated user - query by user_id
      query = query.eq('user_id', userId);
    } else if (guestSessionId) {
      // Guest with session - query by guest_session_id
      query = query.eq('guest_session_id', guestSessionId);
    } else {
      // No user or guest session - return empty or handle as needed
      query = query.is('user_id', null).is('guest_session_id', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as HistoryEntry[];
  } catch (err) {
    console.error('fetchHistoryForUser error', err);
    throw err;
  }
}

/** Soft-delete a history row (mark hidden). Ownership should be enforced by RLS or server-side check. */
export async function softDeleteHistory(id: string, userId?: string | null, guestSessionId?: string | null) {
  try {
    let builder: any = supabase.from('chat_history').update({ is_deleted: true }).eq('id', id);
    
    if (userId) {
      builder = builder.eq('user_id', userId);
    } else if (guestSessionId) {
      builder = builder.eq('guest_session_id', guestSessionId);
    } else {
      builder = builder.is('user_id', null).is('guest_session_id', null);
    }
    
    const { data, error } = await builder.select().single();
    if (error) throw error;
    return data as HistoryEntry;
  } catch (err) {
    console.error('softDeleteHistory error', err);
    throw err;
  }
}

const chatHistoryClient = { saveHistoryEntry, fetchHistoryForUser, softDeleteHistory };
export default chatHistoryClient;
