import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/db/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCodeAndLogin: (email: string, code: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 验证 token 并获取用户信息
  const verifyToken = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;

      if (data.valid && data.user) {
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // 初始化时检查本地存储的 token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const isValid = await verifyToken(token);
        if (!isValid) {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // 发送验证码
  const sendVerificationCode = async (email: string) => {
    const { data, error } = await supabase.functions.invoke('send-verification-code', {
      body: { email },
    });

    if (error) {
      throw new Error(error.message || '发送验证码失败');
    }

    if (data.error) {
      throw new Error(data.error);
    }
  };

  // 验证码登录
  const verifyCodeAndLogin = async (email: string, code: string) => {
    const { data, error } = await supabase.functions.invoke('verify-code-and-login', {
      body: { email, code },
    });

    if (error) {
      throw new Error(error.message || '登录失败');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.success && data.token && data.user) {
      // 保存 token 到本地存储
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
    } else {
      throw new Error('登录响应格式错误');
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('auth_token');
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
        sendVerificationCode,
        verifyCodeAndLogin,
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
