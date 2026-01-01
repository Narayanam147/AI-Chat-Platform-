import { supabase } from './supabase';

export type Message = {
  text: string;
  sender: 'user' | 'ai';
  timestamp?: string;
  attachments?: string[];
};

export type Chat = {
  id?: string;
  user_id?: string | null; // stored as TEXT (emails) or null for guests
  messages: Message[];
  title?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
};

/**
 * Fetch chats for a given user. If `userId` is `null` or `undefined`,
 * this will fetch guest chats where `user_id IS NULL`.
 */
export async function fetchChatsForUser(userId?: string | null): Promise<Chat[]> {
  try {
    // Start base query
    // NOTE: `is_deleted = false` is included to keep soft-deleted rows hidden
    let query: any = supabase
      .from('chats')
      .select('*')
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });

    if (userId == null) {
      // Guests: fetch rows where user_id IS NULL
      query = query.is('user_id', null);
    } else {
      // Logged-in user: fetch rows matching their user_id
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Chat[];
  } catch (err) {
    console.error('fetchChatsForUser error', err);
    throw err;
  }
}

/**
 * Soft-delete a chat by setting `is_deleted = true` and `deleted_at`.
 * Performs an ownership check by filtering on `user_id` (including NULL for guests).
 */
export async function softDeleteChat(chatId: string, userId?: string | null): Promise<Chat | null> {
  try {
    let builder: any = supabase
      .from('chats')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', chatId);

    if (userId == null) {
      builder = builder.is('user_id', null);
    } else {
      builder = builder.eq('user_id', userId);
    }

    const { data, error } = await builder.select().single();
    if (error) throw error;
    return data as Chat;
  } catch (err) {
    console.error('softDeleteChat error', err);
    throw err;
  }
}

/**
 * Insert a new chat row. `user_id` may be a TEXT (email) or null for guest.
 * The `messages` should be an array; this function sets timestamps.
 */
export async function saveNewChat(payload: {
  user_id?: string | null;
  messages: Message[];
  title?: string;
}): Promise<Chat | null> {
  try {
    const row = {
      ...payload,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    const { data, error } = await supabase.from('chats').insert([row]).select().single();
    if (error) throw error;
    return data as Chat;
  } catch (err) {
    console.error('saveNewChat error', err);
    throw err;
  }
}

const chatClient = {
  fetchChatsForUser,
  softDeleteChat,
  saveNewChat,
};

export default chatClient;
