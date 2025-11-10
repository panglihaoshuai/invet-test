import { supabase } from './supabase';
import type { User, VerificationCode, TestResult, Report } from '@/types/types';

// 用户相关API
export const userApi = {
  // 创建或获取用户
  async upsertUser(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .upsert({ email }, { onConflict: 'email' })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error upserting user:', error);
      return null;
    }
    return data;
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
      return null;
    }
    return data;
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
