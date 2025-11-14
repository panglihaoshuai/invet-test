/**
 * 自定义认证辅助函数
 * 用于替代 Supabase Auth 的 getUser() 和 getSession()
 */

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  access_token: string;
  user: User;
}

/**
 * 获取当前用户信息
 * 替代 supabase.auth.getUser()
 */
export async function getCurrentUser(): Promise<{ data: { user: User | null }, error: Error | null }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return { data: { user: null }, error: null };
    }

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      // Token 无效，清除本地存储
      localStorage.removeItem('auth_token');
      return { data: { user: null }, error: new Error('Token 无效') };
    }

    const result = await response.json();

    if (result.valid && result.user) {
      return { data: { user: result.user }, error: null };
    }

    return { data: { user: null }, error: null };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return { data: { user: null }, error: error as Error };
  }
}

/**
 * 获取当前会话信息
 * 替代 supabase.auth.getSession()
 */
export async function getCurrentSession(): Promise<{ data: { session: Session | null }, error: Error | null }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return { data: { session: null }, error: null };
    }

    const result = await getCurrentUser();
    
    if (result.data.user) {
      return {
        data: {
          session: {
            access_token: token,
            user: result.data.user,
          },
        },
        error: null,
      };
    }

    return { data: { session: null }, error: null };
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
