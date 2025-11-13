import { supabase } from './supabase';
import type { User, VerificationCode, TestResult, Report, Order, DeepSeekAnalysis, OrderItem } from '@/types/types';

// 用户相关API
export const userApi = {
  // 创建或获取用户
  async upsertUser(email: string): Promise<User | null> {
    try {
      console.log('[upsertUser] Starting for email:', email);
      
      // 首先尝试获取现有用户
      console.log('[upsertUser] Checking if user exists...');
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .maybeSingle();
      
      console.log('[upsertUser] Fetch result:', { existingUser, fetchError });
      
      // 如果用户已存在，直接返回
      if (existingUser) {
        console.log('[upsertUser] User exists, returning:', existingUser);
        return existingUser;
      }
      
      // 如果查询出错（不是"未找到"的错误），记录错误
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[upsertUser] Error fetching user:', fetchError);
        console.error('[upsertUser] Error details:', JSON.stringify(fetchError, null, 2));
        return null;
      }
      
      // 用户不存在，创建新用户
      console.log('[upsertUser] User does not exist, creating new user...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ email })
        .select()
        .maybeSingle();
      
      console.log('[upsertUser] Insert result:', { newUser, insertError });
      
      if (insertError) {
        console.error('[upsertUser] Error creating user:', insertError);
        console.error('[upsertUser] Error details:', JSON.stringify(insertError, null, 2));
        console.error('[upsertUser] Error code:', insertError.code);
        console.error('[upsertUser] Error message:', insertError.message);
        console.error('[upsertUser] Error hint:', insertError.hint);
        console.error('[upsertUser] Error details:', insertError.details);
        return null;
      }
      
      console.log('[upsertUser] User created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('[upsertUser] Exception:', error);
      console.error('[upsertUser] Exception details:', JSON.stringify(error, null, 2));
      return null;
    }
  },

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data;
  }
};

// 验证码相关API
export const verificationApi = {
  // 创建验证码
  async createVerificationCode(email: string, code: string): Promise<VerificationCode | null> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5分钟后过期

      const { data, error } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code,
          expires_at: expiresAt.toISOString(),
          used: false
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error creating verification code:', error);
        throw new Error(`数据库错误: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Exception in createVerificationCode:', error);
      throw error;
    }
  },

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('verification_codes')
      .select()
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error verifying code:', error);
      return false;
    }

    // 标记验证码为已使用
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id);

    return true;
  }
};

// 测试结果相关API
export const testResultApi = {
  // 创建测试结果
  async createTestResult(userId: string): Promise<TestResult | null> {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_id: userId,
        personality_scores: null,
        math_finance_scores: null,
        risk_preference_scores: null,
        investment_style: null,
        euclidean_distance: null
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating test result:', error);
      return null;
    }
    return data;
  },

  // 更新测试结果
  async updateTestResult(id: string, updates: Partial<TestResult>): Promise<TestResult | null> {
    const { data, error } = await supabase
      .from('test_results')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating test result:', error);
      return null;
    }
    return data;
  },

  // 获取用户的测试结果
  async getUserTestResults(userId: string): Promise<TestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting test results:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  // 获取单个测试结果
  async getTestResult(id: string): Promise<TestResult | null> {
    const { data, error } = await supabase
      .from('test_results')
      .select()
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting test result:', error);
      return null;
    }
    return data;
  },

  // 删除测试结果
  async deleteTestResult(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting test result:', error);
      return false;
    }
    return true;
  },

  // 删除用户所有测试结果
  async deleteAllUserTestResults(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting all test results:', error);
      return false;
    }
    return true;
  }
};

// 报告相关API
export const reportApi = {
  // 创建报告
  async createReport(userId: string, testResultId: string, reportData: any): Promise<Report | null> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24小时后过期

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        test_result_id: testResultId,
        report_data: reportData,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating report:', error);
      return null;
    }
    return data;
  },

  // 获取报告
  async getReport(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select()
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    if (error) {
      console.error('Error getting report:', error);
      return null;
    }
    return data;
  },

  // 获取用户的所有有效报告
  async getUserReports(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select()
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }
};

// 支付相关API
export const paymentApi = {
  // 创建Stripe支付会话
  async createCheckoutSession(items: OrderItem[], testResultId: string): Promise<{ url: string; sessionId: string; orderId: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create_stripe_checkout', {
        body: {
          items,
          test_result_id: testResultId,
          currency: 'cny',
          payment_method_types: ['card']
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  },

  // 验证支付状态
  async verifyPayment(sessionId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('verify_stripe_payment', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error verifying payment:', error);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return null;
    }
  },

  // 获取用户订单列表
  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  // 根据测试结果ID获取已完成的订单
  async getCompletedOrderByTestResult(testResultId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select()
      .eq('test_result_id', testResultId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting completed order:', error);
      return null;
    }
    return data;
  }
};

// DeepSeek分析相关API
export const deepseekApi = {
  // 生成DeepSeek分析（testData从本地存储传入）
  async generateAnalysis(testResultId: string, orderId: string, testData: any): Promise<DeepSeekAnalysis | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate_deepseek_analysis', {
        body: {
          testResultId,
          orderId,
          testData // 从本地存储传入的测试数据
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error generating analysis:', error);
        return null;
      }

      return data.data.analysis;
    } catch (error) {
      console.error('Error generating analysis:', error);
      return null;
    }
  },

  // 获取测试结果的DeepSeek分析
  async getAnalysisByTestResult(testResultId: string): Promise<DeepSeekAnalysis | null> {
    const { data, error } = await supabase
      .from('deepseek_analyses')
      .select()
      .eq('test_result_id', testResultId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting analysis:', error);
      return null;
    }
    return data;
  },

  // 获取用户的所有DeepSeek分析
  async getUserAnalyses(userId: string): Promise<DeepSeekAnalysis[]> {
    const { data, error } = await supabase
      .from('deepseek_analyses')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting user analyses:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }
};
