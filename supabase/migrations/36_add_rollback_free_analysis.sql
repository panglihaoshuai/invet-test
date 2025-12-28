-- 添加回滚免费分析次数的函数
-- 用于分析生成失败时恢复用户的免费次数

CREATE OR REPLACE FUNCTION restore_free_analysis(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption gift_code_redemptions;
BEGIN
  -- 找到最近使用的一次兑换记录（remaining_analyses 最小的）
  -- 这样可以恢复最近扣除的一次
  SELECT * INTO v_redemption
  FROM gift_code_redemptions
  WHERE user_id = p_user_id
    AND remaining_analyses >= 0  -- 包括已用完的
  ORDER BY redeemed_at DESC, remaining_analyses ASC
  LIMIT 1;

  IF v_redemption.id IS NULL THEN
    RETURN false;
  END IF;

  -- 增加一次剩余次数
  UPDATE gift_code_redemptions
  SET remaining_analyses = remaining_analyses + 1
  WHERE id = v_redemption.id;

  RETURN true;
END;
$$;

-- 授予权限
GRANT EXECUTE ON FUNCTION restore_free_analysis(uuid) TO authenticated;

-- 添加注释
COMMENT ON FUNCTION restore_free_analysis IS '恢复用户一次免费分析次数（用于失败回滚）';

