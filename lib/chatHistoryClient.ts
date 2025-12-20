import { supabase } from '@/lib/supabase';

export type HistoryEntry = {
  id?: string;
  user_id?: string | null; // email or null for guests
  prompt: string;
  response: string;
  is_deleted?: boolean;
  created_at?: string;
};

/** Save a history row when AI responds. `userId` may be null for guests. */
export async function saveHistoryEntry({ userId, prompt, response }: { userId?: string | null; prompt: string; response: string; }) {
  try {
    const row = {
      user_id: userId ?? null,
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

/** Fetch visible history for a user (email) or guests (userId === null). */
export async function fetchHistoryForUser(userId?: string | null) {
  try {
    let query: any = supabase.from('chat_history').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
    if (userId == null) query = query.is('user_id', null);
    else query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as HistoryEntry[];
  } catch (err) {
    console.error('fetchHistoryForUser error', err);
    throw err;
  }
}

/** Soft-delete a history row (mark hidden). Ownership should be enforced by RLS or server-side check. */
export async function softDeleteHistory(id: string, userId?: string | null) {
  try {
    let builder: any = supabase.from('chat_history').update({ is_deleted: true }).eq('id', id);
    if (userId == null) builder = builder.is('user_id', null);
    else builder = builder.eq('user_id', userId);
    const { data, error } = await builder.select().single();
    if (error) throw error;
    return data as HistoryEntry;
  } catch (err) {
    console.error('softDeleteHistory error', err);
    throw err;
  }
}

export default { saveHistoryEntry, fetchHistoryForUser, softDeleteHistory };
