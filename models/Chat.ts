import { supabase } from '@/lib/supabase';

export interface Message {
  text: string;
  sender: string;
  timestamp: string;
  attachments?: string[];
}

export interface Chat {
  id: string;
  user_id: string;
  messages: Message[];
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export const ChatModel = {
  async findByUserId(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
    return data || [];
  },

  async findById(id: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async create(chat: Omit<Chat, 'id' | 'created_at' | 'updated_at'>): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .insert([{
        ...chat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Chat>): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating chat:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async deleteByUserId(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', userId);
    
    return !error;
  },
};
