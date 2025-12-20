'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInitialUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ?? null);
      } catch (err) {
        console.error('Error getting user:', err);
        setError(err instanceof Error ? err.message : 'Failed to get user');
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.subscription?.unsubscribe?.();
  }, []);

  return { user, loading, error };
}
