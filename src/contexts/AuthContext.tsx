import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 确保 profile 存在（用于 OAuth 登录）
const ensureProfileExists = async (supabaseUser: SupabaseUser): Promise<void> => {
  try {
    const userEmail = supabaseUser.email?.toLowerCase();
    if (!userEmail) {
      console.warn('⚠️ [ensureProfileExists] 用户邮箱为空，跳过 profile 创建');
      return;
    }

    // 检查 profile 是否存在
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (!existingProfile) {
      console.log('📝 [ensureProfileExists] 创建 profile:', {
        id: supabaseUser.id,
        email: userEmail
      });

      // 创建 profile（触发器会自动设置角色）
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: supabaseUser.id,
          email: userEmail,
          role: 'user', // 默认角色，触发器会覆盖如果是管理员邮箱
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ [ensureProfileExists] 创建 profile 失败:', profileError);
      } else {
        console.log('✅ [ensureProfileExists] Profile 创建成功');
      }
    } else {
      console.log('✅ [ensureProfileExists] Profile 已存在');
    }
  } catch (error) {
    console.error('❌ [ensureProfileExists] 异常:', error);
  }
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('❌ [AuthContext] 获取 session 失败:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        try {
          // 确保 profile 存在
          await ensureProfileExists(session.user);
          const convertedUser = await convertSupabaseUser(session.user);
          if (mounted) {
            setUser(convertedUser);
          }
        } catch (error) {
          console.error('❌ [AuthContext] 初始化用户失败:', error);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 [AuthContext] Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        try {
          // 确保 profile 存在（OAuth 登录可能没有自动创建）
          await ensureProfileExists(session.user);
          const convertedUser = await convertSupabaseUser(session.user);
          if (mounted) {
            setUser(convertedUser);
          }
        } catch (error) {
          console.error('❌ [AuthContext] 更新用户状态失败:', error);
        }
      } else {
        if (mounted) {
          setUser(null);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUpWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Create profile if it doesn't exist
      // The database trigger will automatically set role to 'admin' if email is 1062250152@qq.com
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email?.toLowerCase(),
          role: 'user', // Default role, trigger will override if admin email
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      const convertedUser = await convertSupabaseUser(data.user);
      setUser(convertedUser);
    }
  };

  // Sign in with email and password
  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // 确保 profile 存在
      await ensureProfileExists(data.user);
      const convertedUser = await convertSupabaseUser(data.user);
      setUser(convertedUser);
    }
  };

  // Sign in with OAuth (Google or GitHub)
  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('currentTestId');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signUpWithPassword,
        signInWithPassword,
        signInWithOAuth,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
