/*
# Gift Code System

## Purpose
Allow admins to generate gift codes that grant users 15 free analyses

## New Tables
- `gift_codes` - Store gift code information
- `gift_code_redemptions` - Track gift code usage by users

## Features
- Random gift codes (max 10 characters)
- Each code grants 15 free analyses
- Track redemption history
- Admin can generate and manage codes
- Codes can be deactivated

## Security
- Only admins can generate codes
- Users can only redeem codes once
- Codes can have expiration dates
*/

-- Create gift_codes table
CREATE TABLE IF NOT EXISTS gift_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  max_redemptions integer DEFAULT 1,
  current_redemptions integer DEFAULT 0,
  free_analyses_count integer DEFAULT 15,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT code_length_check CHECK (length(code) <= 10)
);

-- Create gift_code_redemptions table
CREATE TABLE IF NOT EXISTS gift_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code_id uuid REFERENCES gift_codes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  redeemed_at timestamptz DEFAULT now(),
  remaining_analyses integer DEFAULT 15,
  UNIQUE(gift_code_id, user_id)
);

-- Create indexes
CREATE INDEX idx_gift_codes_code ON gift_codes(code);
CREATE INDEX idx_gift_codes_active ON gift_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_gift_code_redemptions_user ON gift_code_redemptions(user_id);
CREATE INDEX idx_gift_code_redemptions_code ON gift_code_redemptions(gift_code_id);

-- Enable RLS
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_codes
CREATE POLICY "Admins can view all gift codes" ON gift_codes
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert gift codes" ON gift_codes
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update gift codes" ON gift_codes
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active gift codes by code" ON gift_codes
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for gift_code_redemptions
CREATE POLICY "Users can view own redemptions" ON gift_code_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions" ON gift_code_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions" ON gift_code_redemptions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Function to generate random gift code
CREATE OR REPLACE FUNCTION generate_gift_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing characters
  result text := '';
  i integer;
  code_length integer := 8; -- Default 8 characters
BEGIN
  FOR i IN 1..code_length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to redeem gift code
CREATE OR REPLACE FUNCTION redeem_gift_code(p_code text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gift_code gift_codes;
  v_existing_redemption gift_code_redemptions;
  v_result jsonb;
BEGIN
  -- Get gift code
  SELECT * INTO v_gift_code
  FROM gift_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  -- Check if code exists
  IF v_gift_code.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '礼品码无效或已过期'
    );
  END IF;

  -- Check if user already redeemed this code
  SELECT * INTO v_existing_redemption
  FROM gift_code_redemptions
  WHERE gift_code_id = v_gift_code.id
    AND user_id = p_user_id;

  IF v_existing_redemption.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '您已经使用过此礼品码',
      'remaining_analyses', v_existing_redemption.remaining_analyses
    );
  END IF;

  -- Check if code has reached max redemptions
  IF v_gift_code.current_redemptions >= v_gift_code.max_redemptions THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '此礼品码已达到最大使用次数'
    );
  END IF;

  -- Create redemption record
  INSERT INTO gift_code_redemptions (gift_code_id, user_id, remaining_analyses)
  VALUES (v_gift_code.id, p_user_id, v_gift_code.free_analyses_count);

  -- Update gift code redemption count
  UPDATE gift_codes
  SET current_redemptions = current_redemptions + 1,
      updated_at = now()
  WHERE id = v_gift_code.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', '礼品码兑换成功！',
    'free_analyses', v_gift_code.free_analyses_count
  );
END;
$$;

-- Function to check user's remaining free analyses
CREATE OR REPLACE FUNCTION get_user_free_analyses(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total integer;
BEGIN
  SELECT COALESCE(SUM(remaining_analyses), 0) INTO v_total
  FROM gift_code_redemptions
  WHERE user_id = p_user_id
    AND remaining_analyses > 0;

  RETURN v_total;
END;
$$;

-- Function to consume one free analysis
CREATE OR REPLACE FUNCTION consume_free_analysis(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption gift_code_redemptions;
BEGIN
  -- Get the oldest redemption with remaining analyses
  SELECT * INTO v_redemption
  FROM gift_code_redemptions
  WHERE user_id = p_user_id
    AND remaining_analyses > 0
  ORDER BY redeemed_at ASC
  LIMIT 1;

  IF v_redemption.id IS NULL THEN
    RETURN false;
  END IF;

  -- Decrease remaining analyses
  UPDATE gift_code_redemptions
  SET remaining_analyses = remaining_analyses - 1
  WHERE id = v_redemption.id;

  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_gift_code() TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_gift_code(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_free_analyses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_free_analysis(uuid) TO authenticated;

-- Create view for admin to see gift code statistics
CREATE OR REPLACE VIEW gift_code_stats AS
SELECT 
  gc.id,
  gc.code,
  gc.max_redemptions,
  gc.current_redemptions,
  gc.free_analyses_count,
  gc.is_active,
  gc.expires_at,
  gc.created_at,
  p.email as created_by_email,
  COUNT(gcr.id) as total_redemptions,
  COALESCE(SUM(gcr.remaining_analyses), 0) as total_remaining_analyses
FROM gift_codes gc
LEFT JOIN profiles p ON p.id = gc.created_by
LEFT JOIN gift_code_redemptions gcr ON gcr.gift_code_id = gc.id
GROUP BY gc.id, gc.code, gc.max_redemptions, gc.current_redemptions, 
         gc.free_analyses_count, gc.is_active, gc.expires_at, gc.created_at, p.email;

-- Grant access to view
GRANT SELECT ON gift_code_stats TO authenticated;

-- Comments
COMMENT ON TABLE gift_codes IS '礼品码表';
COMMENT ON TABLE gift_code_redemptions IS '礼品码兑换记录表';
COMMENT ON FUNCTION generate_gift_code IS '生成随机礼品码';
COMMENT ON FUNCTION redeem_gift_code IS '兑换礼品码';
COMMENT ON FUNCTION get_user_free_analyses IS '获取用户剩余免费分析次数';
COMMENT ON FUNCTION consume_free_analysis IS '消耗一次免费分析';
COMMENT ON VIEW gift_code_stats IS '礼品码统计视图';
