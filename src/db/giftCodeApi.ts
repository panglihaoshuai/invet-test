import { getCurrentUser } from "@/utils/auth";
import { supabase } from './supabase';
import type { GiftCode, GiftCodeStats, RedeemGiftCodeResult } from '@/types/types';

// 礼品码相关API
export const giftCodeApi = {
  // 生成礼品码（管理员）
  async generateGiftCode(maxRedemptions: number = 1, expiresInDays?: number): Promise<GiftCode | null> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        console.error('❌ generateGiftCode: 未找到用户');
        return null;
      }

      console.log('🎁 generateGiftCode: 开始生成', { user_id: user.id, maxRedemptions, expiresInDays });

      // 生成随机礼品码
      const { data: codeData, error: codeError } = await supabase.rpc('generate_gift_code');
      
      if (codeError || !codeData) {
        console.error('❌ generateGiftCode: RPC 生成码失败', codeError);
        return null;
      }

      const code = codeData as string;
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
        free_analyses_count: 15,
        created_by: user.id,
        expires_at: expiresAt
      });

      // 插入礼品码
      const { data, error } = await supabase
        .from('gift_codes')
        .insert({
          code,
          max_redemptions: maxRedemptions,
          free_analyses_count: 15,
          created_by: user.id,
          expires_at: expiresAt
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ generateGiftCode: 插入失败', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
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
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          message: '请先登录'
        };
      }

      const { data, error } = await supabase.rpc('redeem_gift_code', {
        p_code: code.toUpperCase(),
        p_user_id: user.id
      });

      if (error) {
        console.error('Error redeeming gift code:', error);
        return {
          success: false,
          message: '兑换失败，请稍后重试'
        };
      }

      return data as RedeemGiftCodeResult;
    } catch (error) {
      console.error('Error redeeming gift code:', error);
      return {
        success: false,
        message: '兑换失败，请稍后重试'
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
