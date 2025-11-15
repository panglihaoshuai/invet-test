import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCodeAndLogin: (email: string, code: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify token and get user info
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();

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

  // Initialize auth on mount
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

  // Send verification code
  const sendVerificationCode = async (email: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to send verification code' }));
      throw new Error(errorData.error || 'Failed to send verification code');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
  };

  // Verify code and login
  const verifyCodeAndLogin = async (email: string, code: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-code-and-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.success && data.token && data.user) {
      // Save token and user to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error('Invalid login response format');
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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
