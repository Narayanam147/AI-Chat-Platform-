import { supabase } from '@/lib/supabase';

export interface Message {
  text: string;
  sender: string;
  timestamp: string;
  attachments?: string[];
}

export interface ChatHistory {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  title?: string;
  pinned?: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const ChatModel = {
  async findByUserId(userId: string): Promise<ChatHistory[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat_history:', error);
      return [];
    }
    return data || [];
  },

  async findById(id: string): Promise<ChatHistory | null> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async create(chat: { user_id: string; prompt: string; response: string; title?: string; pinned?: boolean }): Promise<ChatHistory | null> {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([{
        user_id: chat.user_id,
        prompt: chat.prompt,
        response: chat.response,
        title: chat.title || chat.prompt.substring(0, 50),
        pinned: chat.pinned || false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat_history:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<ChatHistory>): Promise<ChatHistory | null> {
    const { data, error } = await supabase
      .from('chat_history')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating chat_history:', error);
      return null;
    }
    return data;
  },

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_history')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    return !error;
  },

  async hardDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async deleteByUserId(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_history')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    return !error;
  },
};
