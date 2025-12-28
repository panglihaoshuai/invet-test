/**
 * Supabase Auth 辅助函数
 * 使用 Supabase Auth 的 getUser() 和 getSession()
 */

import { supabase } from '@/db/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role?: string;
  created_at: string;
}

interface Session {
  access_token: string;
  user: User;
}

// Helper function to convert Supabase user to our User type
const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role: profile?.role || 'user',
    created_at: supabaseUser.created_at || new Date().toISOString(),
  };
};

/**
 * 获取当前用户信息
 * 使用 supabase.auth.getUser()
 */
export async function getCurrentUser(): Promise<{ data: { user: User | null }, error: Error | null }> {
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { data: { user: null }, error };
    }

    const user = await convertSupabaseUser(supabaseUser);
          return { data: { user }, error: null };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return { data: { user: null }, error: error as Error };
  }
}

/**
 * 获取当前会话信息
 * 使用 supabase.auth.getSession()
 */
export async function getCurrentSession(): Promise<{ data: { session: Session | null }, error: Error | null }> {
  try {
    const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();

    if (error || !supabaseSession) {
      return { data: { session: null }, error: error ? new Error(error.message) : null };
    }

    const user = await convertSupabaseUser(supabaseSession.user);
    
    if (!user) {
      return { data: { session: null }, error: null };
    }

      return {
        data: {
          session: {
          access_token: supabaseSession.access_token,
          user,
          },
        },
        error: null,
      };
  } catch (error) {
    console.error('获取会话信息失败:', error);
    return { data: { session: null }, error: error as Error };
  }
}

/**
 * 获取当前用户 ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await getCurrentUser();
  return data.user?.id || null;
}
