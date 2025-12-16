import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  image?: string;
  provider?: string;
  created_at?: string;
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return data;
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async create(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return null;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    return !error;
  },
};
