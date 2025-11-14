-- ============================================================================
-- 人格特质投资策略评估系统 - 完整数据库创建脚本
-- ============================================================================
-- 如果您想在新的 Supabase 项目中创建所有表，请在 SQL Editor 中运行此脚本
-- ============================================================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. 创建验证码表
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- 3. 创建测试提交表
CREATE TABLE IF NOT EXISTS public.test_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    test_type text NOT NULL, -- 'personality', 'math_finance', 'risk_preference'
    answers jsonb NOT NULL,
    score numeric,
    completed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. 创建测试结果表
CREATE TABLE IF NOT EXISTS public.test_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    personality_scores jsonb, -- Big Five 分数
    math_finance_score numeric,
    risk_preference_score numeric,
    recommended_strategy text,
    strategy_match_score numeric,
    completed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. 创建报告表
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    test_result_id uuid REFERENCES public.test_results(id) ON DELETE CASCADE,
    report_data jsonb NOT NULL,
    pdf_url text,
    created_at timestamptz DEFAULT now()
);

-- 6. 创建用户资料表（profiles）
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    role text DEFAULT 'user' NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. 创建订单表
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    order_number text UNIQUE NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'CNY',
    status text DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method text,
    payment_intent_id text,
    stripe_session_id text,
    items jsonb,
    metadata jsonb,
    paid_at timestamptz,
    refunded_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- 新增字段
    stripe_customer_id text,
    stripe_payment_method_id text,
    receipt_url text,
    invoice_url text
);

-- 8. 创建礼品码表
CREATE TABLE IF NOT EXISTS public.gift_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    type text NOT NULL, -- 'single_use', 'multi_use'
    value numeric NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 9. 创建礼品码兑换记录表
CREATE TABLE IF NOT EXISTS public.gift_code_redemptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_code_id uuid REFERENCES public.gift_codes(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    redeemed_at timestamptz DEFAULT now(),
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL
);

-- 10. 创建礼品码统计表
CREATE TABLE IF NOT EXISTS public.gift_code_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_code_id uuid REFERENCES public.gift_codes(id) ON DELETE CASCADE,
    total_redemptions integer DEFAULT 0,
    total_value numeric DEFAULT 0,
    unique_users integer DEFAULT 0,
    last_redeemed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- 新增字段
    redemption_rate numeric,
    average_order_value numeric,
    conversion_rate numeric
);

-- 11. 创建 DeepSeek 分析表
CREATE TABLE IF NOT EXISTS public.deepseek_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    test_result_id uuid REFERENCES public.test_results(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    response text NOT NULL,
    model text DEFAULT 'deepseek-chat',
    tokens_used integer,
    created_at timestamptz DEFAULT now()
);

-- 12. 创建系统配置表
CREATE TABLE IF NOT EXISTS public.system_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 13. 创建系统设置表
CREATE TABLE IF NOT EXISTS public.system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text UNIQUE NOT NULL,
    setting_value jsonb NOT NULL,
    setting_type text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 14. 创建管理员日志表
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    details jsonb,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- 15. 创建管理员统计表
CREATE TABLE IF NOT EXISTS public.admin_statistics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date UNIQUE NOT NULL,
    total_users integer DEFAULT 0,
    new_users integer DEFAULT 0,
    total_orders integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    total_tests integer DEFAULT 0,
    total_reports integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 16. 创建用户定价信息表
CREATE TABLE IF NOT EXISTS public.user_pricing_info (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    base_price numeric DEFAULT 99.00,
    discount_percentage numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 插入初始系统配置
-- ============================================================================

-- 插入 DeepSeek 开关配置
INSERT INTO public.system_config (key, value, description)
VALUES (
    'deepseek_enabled',
    'true'::jsonb,
    'DeepSeek AI 分析功能开关'
)
ON CONFLICT (key) DO NOTHING;

-- 插入基础价格配置
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description)
VALUES (
    'base_price',
    '99.00'::jsonb,
    'number',
    '报告基础价格（元）'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 插入渐进式定价配置
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description)
VALUES (
    'progressive_pricing_enabled',
    'true'::jsonb,
    'boolean',
    '是否启用渐进式定价'
)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 创建索引以提高查询性能
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_test_submissions_user_id ON public.test_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_gift_codes_code ON public.gift_codes(code);
CREATE INDEX IF NOT EXISTS idx_deepseek_analyses_user_id ON public.deepseek_analyses(user_id);

-- ============================================================================
-- 配置 Row Level Security (RLS)
-- ============================================================================

-- 禁用 users 表的 RLS（因为需要公开访问）
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 禁用 verification_codes 表的 RLS
ALTER TABLE public.verification_codes DISABLE ROW LEVEL SECURITY;

-- 其他表根据需要配置 RLS
-- 注意：如果需要更严格的安全控制，可以启用 RLS 并创建相应的策略

-- ============================================================================
-- 创建触发器函数
-- ============================================================================

-- 自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_submissions_updated_at
    BEFORE UPDATE ON public.test_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_codes_updated_at
    BEFORE UPDATE ON public.gift_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
    BEFORE UPDATE ON public.system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 发送 NOTIFY 信号以刷新 PostgREST 缓存
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- 完成
-- ============================================================================

-- 验证表创建
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
