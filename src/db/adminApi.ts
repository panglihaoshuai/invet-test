import { supabase } from './supabase';
import { getCurrentUser } from '@/utils/auth';
import type { Profile, SystemSetting, TestSubmission, AdminLog, AdminStatistics, UserPricingInfo } from '@/types/types';

// 管理员相关API
export const adminApi = {
  // 检查当前用户是否为管理员
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return false;

      // 首先检查用户对象中的 role 字段
      if (user.role === 'admin') return true;

      // 如果用户对象中没有 role，从 profiles 表查询
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) return false;
      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // 获取当前用户的profile
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error getting profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // 获取统计数据
  async getStatistics(): Promise<AdminStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('admin_statistics')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error getting statistics:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  },

  // 获取测试提交记录
  async getTestSubmissions(limit = 100): Promise<TestSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('test_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting test submissions:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getting test submissions:', error);
      return [];
    }
  },

  // 获取按IP分组的测试统计
  async getTestsByIP(): Promise<{ ip_address: string; count: number; country: string | null; city: string | null }[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_tests_by_ip');

      if (error) {
        console.error('Error getting tests by IP:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getting tests by IP:', error);
      return [];
    }
  },

  // 获取系统设置
  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', key)
        .maybeSingle();

      if (error) {
        console.error('Error getting system setting:', error);
        return null;
    }
      return data;
    } catch (error) {
      console.error('Error getting system setting:', error);
      return null;
    }
  },

  // 获取支付系统状态
  async getPaymentSystemStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('get_payment_system_status');

      if (error) {
        console.error('Error getting payment system status:', error);
        return true; // 默认开启
      }
      return data === true;
    } catch (error) {
      console.error('Error getting payment system status:', error);
      return true;
    }
  },

  // 切换支付系统
  async togglePaymentSystem(enabled: boolean): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('toggle_payment_system', { enabled });

      if (error) {
        console.error('Error toggling payment system:', error);
        return false;
      }
      return data?.success === true;
    } catch (error) {
      console.error('Error toggling payment system:', error);
      return false;
    }
  },

  // 获取管理员日志
  async getAdminLogs(limit = 100): Promise<AdminLog[]> {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting admin logs:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getting admin logs:', error);
      return [];
    }
  },

  // 记录管理员操作
  async logAction(
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any,
    ipAddress?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_admin_action', {
        p_action: action,
        p_target_type: targetType || null,
        p_target_id: targetId || null,
        p_details: details || null,
        p_ip_address: ipAddress || null
      });

      if (error) {
        console.error('Error logging admin action:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error logging admin action:', error);
      return null;
    }
  },

  // 获取所有用户profiles
  async getAllProfiles(limit = 100): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting profiles:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  },

  // 更新用户角色
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      // 记录操作
      await this.logAction('update_user_role', 'profile', userId, { role });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  },

  // 获取用户的分析价格
  async getUserAnalysisPrice(userId?: string): Promise<number> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await getCurrentUser();
        if (!user) return 399; // 默认首次价格
        targetUserId = user.id;
      }

      const { data, error } = await supabase.rpc('get_user_analysis_price', {
        p_user_id: targetUserId
      });

      if (error) {
        console.error('Error getting user analysis price:', error);
        return 399; // 默认首次价格
      }
      return data || 399;
    } catch (error) {
      console.error('Error getting user analysis price:', error);
      return 399;
    }
  },

  // 获取当前用户的定价信息
  async getCurrentUserPricingInfo(): Promise<UserPricingInfo | null> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_pricing_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error getting pricing info:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting pricing info:', error);
      return null;
    }
  },

  // 更新系统配置中的管理员邮箱
  async updateAdminEmail(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ 
          config_value: email,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', 'admin_email');

      if (error) {
        console.error('Error updating admin email:', error);
        return false;
      }

      // 记录操作
      await this.logAction('update_admin_email', 'system_config', null, { email });
      return true;
    } catch (error) {
      console.error('Error updating admin email:', error);
      return false;
    }
  },

  // 获取 DeepSeek 功能开关状态
  async getDeepSeekEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'deepseek_enabled')
        .maybeSingle();

      if (error) {
        console.error('Error getting DeepSeek status:', error);
        return false;
      }

      return data?.config_value === 'true';
    } catch (error) {
      console.error('Error getting DeepSeek status:', error);
      return false;
    }
  },

  // 更新 DeepSeek 功能开关
  async updateDeepSeekEnabled(enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ 
          config_value: enabled ? 'true' : 'false',
          updated_at: new Date().toISOString()
        })
        .eq('config_key', 'deepseek_enabled');

      if (error) {
        console.error('Error updating DeepSeek status:', error);
        return false;
      }

      // 记录操作
      await this.logAction('update_deepseek_status', 'system_config', null, { enabled });
      return true;
    } catch (error) {
      console.error('Error updating DeepSeek status:', error);
      return false;
    }
  }
};

// 测试提交追踪API
export const testSubmissionApi = {
  // 记录测试提交
  async trackTestSubmission(
    testType: string,
    completed: boolean = false
  ): Promise<string | null> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return null;

      // 获取IP地址和用户代理（从浏览器）
      const userAgent = navigator.userAgent;

      const { data, error } = await supabase
        .from('test_submissions')
        .insert({
          user_id: user.id,
          test_type: testType,
          user_agent: userAgent,
          completed
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking test submission:', error);
        return null;
      }
      return data.id;
    } catch (error) {
      console.error('Error tracking test submission:', error);
      return null;
    }
  },

  // 更新测试完成状态
  async updateTestCompletion(submissionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('test_submissions')
        .update({ completed: true })
        .eq('id', submissionId);

      if (error) {
        console.error('Error updating test completion:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating test completion:', error);
      return false;
    }
  }
};
