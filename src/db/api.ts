import { supabase } from './supabase';
import { getCurrentSession } from '@/utils/auth';
import type { User, VerificationCode, TestResult, Report, Order, DeepSeekAnalysis, OrderItem } from '@/types/types';

// 用户相关API
export const userApi = {
  // 创建或获取用户
  async upsertUser(email: string): Promise<User | null> {
    try {
      console.log('[upsertUser] 开始处理邮箱:', email);
      
      // 方法 1: 尝试直接访问 users 表
      console.log('[upsertUser] 尝试直接访问 users 表...');
      
      // 首先尝试获取现有用户
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      console.log('[upsertUser] 查询结果:', { existingUser, fetchError });
      
      // 如果用户已存在，直接返回
      if (existingUser) {
        console.log('[upsertUser] 用户已存在:', existingUser);
        return existingUser;
      }
      
      // 如果查询出错但不是"未找到"错误，记录错误
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[upsertUser] 查询用户失败:', fetchError);
        
        // 如果是缓存问题 (PGRST205)，尝试使用 Edge Function
        if (fetchError.code === 'PGRST205') {
          console.log('[upsertUser] 检测到缓存问题，尝试使用 Edge Function...');
          try {
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('upsert-user', {
              body: { email }
            });
            
            if (!edgeError && edgeData && edgeData.data) {
              console.log('[upsertUser] Edge Function 成功:', edgeData.data);
              return edgeData.data as User;
            }
            console.error('[upsertUser] Edge Function 失败:', edgeError);
          } catch (edgeErr) {
            console.error('[upsertUser] Edge Function 异常:', edgeErr);
          }
        }
        
        return null;
      }
      
      // 用户不存在，创建新用户
      console.log('[upsertUser] 用户不存在，创建新用户...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ email })
        .select()
        .maybeSingle();
      
      console.log('[upsertUser] 创建结果:', { newUser, insertError });
      
      if (insertError) {
        console.error('[upsertUser] 创建用户失败:', insertError);
        
        // 如果是缓存问题，尝试使用 Edge Function
        if (insertError.code === 'PGRST205') {
          console.log('[upsertUser] 检测到缓存问题，尝试使用 Edge Function...');
          try {
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('upsert-user', {
              body: { email }
            });
            
            if (!edgeError && edgeData && edgeData.data) {
              console.log('[upsertUser] Edge Function 成功:', edgeData.data);
              return edgeData.data as User;
            }
            console.error('[upsertUser] Edge Function 失败:', edgeError);
          } catch (edgeErr) {
            console.error('[upsertUser] Edge Function 异常:', edgeErr);
          }
        }
        
        return null;
      }
      
      console.log('[upsertUser] 用户创建成功:', newUser);
      return newUser;
    } catch (error) {
      console.error('[upsertUser] 异常:', error);
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
      const { data: { session } } = await getCurrentSession();
      
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
  async generateAnalysis(testResultId: string, orderId: string, testData: any, language: 'zh' | 'en' = 'zh'): Promise<DeepSeekAnalysis | null> {
    try {
      const { data: { session } } = await getCurrentSession();
      
      if (!session?.access_token) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate_deepseek_analysis', {
        body: {
          testResultId,
          orderId,
          testData,
          language
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

  async generateAnalysisFree(testResultId: string, testData: any, language: 'zh' | 'en' = 'zh'): Promise<DeepSeekAnalysis | null> {
    const errorCode = 'GENERATE_FREE_ANALYSIS_ERROR';
    try {
      console.log(`🎁 [${errorCode}] 开始生成免费分析:`, { testResultId, language });
      
      const { data: { session }, error: sessionError } = await getCurrentSession();
      
      if (sessionError) {
        console.error(`❌ [${errorCode}_001] 获取session失败:`, sessionError);
        throw new Error(`获取session失败: ${sessionError.message || '未知错误'}`);
      }
      
      if (!session?.access_token) {
        console.error(`❌ [${errorCode}_002] 用户未认证:`, { 
          hasSession: !!session,
          hasAccessToken: !!session?.access_token 
        });
        throw new Error('用户未认证，请先登录');
      }

      // 清理 testData，确保可以序列化（移除循环引用、函数、undefined 等）
      let cleanTestData: any = {};
      try {
        // 使用 JSON.parse(JSON.stringify()) 来深度克隆并清理数据
        cleanTestData = JSON.parse(JSON.stringify(testData || {}));
        console.log(`🧹 [${errorCode}] testData 清理完成:`, {
          originalKeys: testData ? Object.keys(testData).slice(0, 10) : [],
          cleanedKeys: Object.keys(cleanTestData).slice(0, 10),
          cleanedSize: JSON.stringify(cleanTestData).length
        });
      } catch (cleanError) {
        console.error(`❌ [${errorCode}_CLEAN] testData 清理失败:`, cleanError);
        // 如果清理失败，尝试使用原始数据
        cleanTestData = testData || {};
      }

      // 构建请求体对象，确保所有字段都是可序列化的
      const requestBody = {
        testResultId: String(testResultId || ''),
        testData: cleanTestData || {},
        language: language || 'zh'
      };

      // 验证请求体可以正确序列化
      let serializedBody: string;
      try {
        serializedBody = JSON.stringify(requestBody);
        console.log(`✅ [${errorCode}] 请求体序列化验证成功:`, {
          bodySize: serializedBody.length,
          bodyPreview: serializedBody.substring(0, 200)
        });
      } catch (serializeError) {
        console.error(`❌ [${errorCode}_SERIALIZE] 请求体序列化失败:`, serializeError);
        throw new Error('请求体序列化失败，请检查 testData 格式');
      }

      // 获取 Supabase URL 和 anon key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase 配置缺失');
      }

      const functionUrl = `${supabaseUrl}/functions/v1/generate_deepseek_analysis_free`;

      console.log(`🔐 [${errorCode}] 调用 Edge Function...`, {
        testResultId,
        language,
        hasAccessToken: !!session.access_token,
        tokenLength: session.access_token?.length || 0,
        tokenPrefix: session.access_token ? session.access_token.substring(0, 30) + '...' : 'N/A',
        testDataKeys: Object.keys(cleanTestData).slice(0, 10),
        requestBodySize: serializedBody.length,
        functionUrl
      });
      
      // 使用 fetch API 直接调用 Edge Function，确保请求体正确序列化
      // 添加超时处理（60秒，因为生成分析可能需要较长时间）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
      
      let response: Response;
      try {
        response = await fetch(functionUrl, {
          method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
          },
          body: serializedBody, // 使用已序列化的 JSON 字符串
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // 如果是超时或连接关闭，尝试从数据库获取已生成的分析
        if (fetchError instanceof Error && (
          fetchError.name === 'AbortError' || 
          fetchError.message.includes('ERR_CONNECTION_CLOSED') ||
          fetchError.message.includes('network')
        )) {
          console.warn(`⚠️ [${errorCode}_TIMEOUT] 请求超时或连接关闭，尝试从数据库获取分析...`);
          
          // 等待几秒让 Edge Function 完成
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // 尝试从数据库获取最新生成的分析
          try {
            // 使用 deepseekApi 对象的方法（因为这是在对象方法内部）
            const { data: existingAnalysis, error: fetchError } = await supabase
              .from('deepseek_analyses')
              .select()
              .eq('test_result_id', testResultId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (!fetchError && existingAnalysis) {
              console.log(`✅ [${errorCode}_RECOVER] 从数据库恢复分析:`, existingAnalysis.id);
              return existingAnalysis;
        }
          } catch (recoverError) {
            console.error(`❌ [${errorCode}_RECOVER] 恢复失败:`, recoverError);
          }
          
          throw new Error('请求超时：分析可能正在生成中，请稍后刷新页面查看结果');
        }
        
        throw fetchError;
      }

      // 检查响应状态
      if (!response.ok) {
        let errorMessage = '生成分析失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error(`❌ [${errorCode}_003] Edge Function 调用失败:`, {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          hasAccessToken: !!session.access_token,
          tokenLength: session.access_token?.length || 0
        });
        
        // 根据错误类型提供更详细的错误信息
        if (response.status === 401) {
          throw new Error('认证失败：Token无效或已过期，请重新登录后再试');
        } else if (response.status === 400) {
          throw new Error(errorMessage || '请求参数错误');
        } else if (response.status === 500) {
          throw new Error(errorMessage || '服务器错误，请稍后重试');
        } else {
          throw new Error(errorMessage || '生成分析失败');
        }
      }

      // 解析响应数据
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error(`❌ [${errorCode}_004] 解析响应失败:`, parseError);
        throw new Error('服务器响应格式错误');
      }

      if (!data || data.code !== 'SUCCESS' || !data.data || !data.data.analysis) {
        console.error(`❌ [${errorCode}_004] 返回数据格式错误:`, data);
        throw new Error(data?.message || '返回数据格式错误');
      }

      console.log(`✅ [${errorCode}] 免费分析生成成功:`, data.data.analysis.id);
      return data.data.analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [${errorCode}_005] 生成免费分析异常:`, {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // 重新抛出错误，让调用者处理
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

