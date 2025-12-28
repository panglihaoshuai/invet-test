import { getCurrentUser } from "@/utils/auth";
import { supabase } from './supabase';
import type { GiftCode, GiftCodeStats, RedeemGiftCodeResult } from '@/types/types';

// 礼品码相关API
export const giftCodeApi = {
  // 生成礼品码（管理员）
  async generateGiftCode(maxRedemptions: number = 1, expiresInDays?: number, freeAnalysesCount: number = 15): Promise<GiftCode | null> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        console.error('❌ generateGiftCode: 未找到用户');
        return null;
      }

      console.log('🎁 generateGiftCode: 开始生成', { user_id: user.id, maxRedemptions, expiresInDays });

      let isAdmin = user.role === 'admin';
      if (!isAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        isAdmin = profile?.role === 'admin';
      }
      if (!isAdmin) {
        console.error('❌ generateGiftCode: 非管理员禁止生成');
        return null;
      }

      // 生成随机礼品码
      let code: string | null = null;
      const { data: codeData, error: codeError } = await supabase.rpc('generate_gift_code');
      if (!codeError && codeData) {
        code = codeData as string;
      }
      if (!code) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const gen = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        let attempt = 0;
        while (attempt < 10) {
          const candidate = gen(8);
          const { data: existing } = await supabase
            .from('gift_codes')
            .select('id')
            .eq('code', candidate)
            .maybeSingle();
          if (!existing) {
            code = candidate;
            break;
          }
          attempt += 1;
        }
        if (!code) {
          console.error('❌ generateGiftCode: 本地生成码失败');
          return null;
        }
      }
      console.log('✅ generateGiftCode: 生成随机码', code);

      // 计算过期时间
      let expiresAt = null;
      if (expiresInDays) {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + expiresInDays);
        expiresAt = expireDate.toISOString();
      }

      console.log('🎁 generateGiftCode: 插入数据库', {
        code,
        max_redemptions: maxRedemptions,
        free_analyses_count: freeAnalysesCount,
        created_by: user.id,
        expires_at: expiresAt
      });

      // 插入礼品码
      const { data, error } = await supabase
        .from('gift_codes')
        .insert({
          code,
          max_redemptions: maxRedemptions,
          free_analyses_count: freeAnalysesCount,
          created_by: user.id,
          expires_at: expiresAt
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ generateGiftCode: 插入失败');
        console.error('错误消息:', error.message);
        console.error('错误详情:', error.details);
        console.error('错误提示:', error.hint);
        console.error('错误代码:', error.code);
        console.error('完整错误对象:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('✅ generateGiftCode: 成功', data);
      return data;
    } catch (error) {
      console.error('❌ generateGiftCode: 异常', error);
      return null;
    }
  },

  // 获取所有礼品码统计（管理员）
  async getAllGiftCodes(): Promise<GiftCodeStats[]> {
    try {
      const { data, error } = await supabase
        .from('gift_code_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gift codes:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching gift codes:', error);
      return [];
    }
  },

  // 停用礼品码（管理员）
  async deactivateGiftCode(codeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gift_codes')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', codeId);

      if (error) {
        console.error('Error deactivating gift code:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deactivating gift code:', error);
      return false;
    }
  },

  // 激活礼品码（管理员）
  async activateGiftCode(codeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gift_codes')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', codeId);

      if (error) {
        console.error('Error activating gift code:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error activating gift code:', error);
      return false;
    }
  },

  // 兑换礼品码（用户）
  async redeemGiftCode(code: string): Promise<RedeemGiftCodeResult> {
    const errorCode = 'GIFT_CODE_REDEEM_ERROR';
    try {
      console.log('🎁 [giftCodeApi.redeemGiftCode] 开始兑换礼品码:', { code: code.toUpperCase() });
      
      const { data: { user }, error: userError } = await getCurrentUser();
      if (userError) {
        console.error(`❌ [${errorCode}_001] 获取用户信息失败:`, userError);
        return {
          success: false,
          message: '请先登录',
          errorCode: `${errorCode}_001`,
          errorDetails: userError.message || 'Failed to get current user'
        };
      }
      
      if (!user) {
        console.error(`❌ [${errorCode}_002] 用户未登录`);
        return {
          success: false,
          message: '请先登录',
          errorCode: `${errorCode}_002`,
          errorDetails: 'User not authenticated'
        };
      }

      console.log('🎁 [giftCodeApi.redeemGiftCode] 调用数据库函数:', { 
        p_code: code.toUpperCase(), 
        p_user_id: user.id 
      });

      const { data, error } = await supabase.rpc('redeem_gift_code', {
        p_code: code.toUpperCase(),
        p_user_id: user.id
      });

      if (error) {
        console.error(`❌ [${errorCode}_003] 数据库函数调用失败:`, {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          code: code.toUpperCase(),
          userId: user.id
        });
        return {
          success: false,
          message: `兑换失败: ${error.message || '数据库错误'}`,
          errorCode: `${errorCode}_003`,
          errorDetails: JSON.stringify({
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
        };
      }

      console.log('✅ [giftCodeApi.redeemGiftCode] 兑换成功:', data);
      return data as RedeemGiftCodeResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`❌ [${errorCode}_004] 兑换过程发生异常:`, {
        error: errorMessage,
        stack: errorStack,
        code: code.toUpperCase()
      });
      return {
        success: false,
        message: `兑换失败: ${errorMessage}`,
        errorCode: `${errorCode}_004`,
        errorDetails: errorStack || errorMessage
      };
    }
  },

  // 获取用户剩余免费分析次数
  async getUserFreeAnalyses(): Promise<number> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return 0;

      const { data, error } = await supabase.rpc('get_user_free_analyses', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error getting free analyses:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting free analyses:', error);
      return 0;
    }
  },

  // 消耗一次免费分析
  async consumeFreeAnalysis(): Promise<boolean> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('consume_free_analysis', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error consuming free analysis:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error consuming free analysis:', error);
      return false;
    }
  },

  // 获取用户的礼品码兑换记录
  async getUserRedemptions(): Promise<any[]> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('gift_code_redemptions')
        .select(`
          *,
          gift_codes (
            code,
            free_analyses_count
          )
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) {
        console.error('Error fetching redemptions:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      return [];
    }
  }
};
