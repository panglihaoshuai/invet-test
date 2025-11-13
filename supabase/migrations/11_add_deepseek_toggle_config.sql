/*
# Add DeepSeek Toggle Configuration

## Changes
1. Add deepseek_enabled configuration to system_config table
2. Default value is 'false' (disabled)

## Configuration
- `deepseek_enabled` - Controls whether DeepSeek AI analysis feature is available
  - 'true': Show DeepSeek analysis purchase option
  - 'false': Hide DeepSeek analysis feature completely
*/

-- Add DeepSeek toggle configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES ('deepseek_enabled', 'false', 'DeepSeek AI分析功能开关（true=开启，false=关闭）')
ON CONFLICT (config_key) DO UPDATE
SET description = 'DeepSeek AI分析功能开关（true=开启，false=关闭）';
