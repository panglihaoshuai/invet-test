import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/db/adminApi';
import { Settings, Brain, Loader2 } from 'lucide-react';

const SystemSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [deepseekEnabled, setDeepseekEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const enabled = await adminApi.getDeepSeekEnabled();
      setDeepseekEnabled(enabled);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: '加载失败',
        description: '无法加载系统设置',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDeepSeek = async (checked: boolean) => {
    setIsSaving(true);
    try {
      const success = await adminApi.updateDeepSeekEnabled(checked);
      if (success) {
        setDeepseekEnabled(checked);
        toast({
          title: '设置已更新',
          description: checked ? 'DeepSeek AI 分析功能已开启' : 'DeepSeek AI 分析功能已关闭'
        });
      } else {
        toast({
          title: '更新失败',
          description: '无法更新设置，请重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating DeepSeek setting:', error);
      toast({
        title: '更新失败',
        description: '发生错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="text-muted-foreground">管理系统功能和配置</p>
        </div>
      </div>

      {/* DeepSeek AI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>DeepSeek AI 分析功能</CardTitle>
          </div>
          <CardDescription>
            控制是否在测试结果页面显示 DeepSeek AI 深度分析功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="deepseek-toggle" className="text-base font-medium">
                启用 DeepSeek AI 分析
              </Label>
              <p className="text-sm text-muted-foreground">
                {deepseekEnabled 
                  ? '用户可以看到并购买 AI 深度分析服务' 
                  : '用户无法看到 AI 深度分析功能'}
              </p>
            </div>
            <Switch
              id="deepseek-toggle"
              checked={deepseekEnabled}
              onCheckedChange={handleToggleDeepSeek}
              disabled={isSaving}
            />
          </div>

          {deepseekEnabled && (
            <div className="rounded-lg bg-primary/5 p-4 space-y-2">
              <p className="text-sm font-medium">功能说明：</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>用户完成测试后可以看到"获取 AI 深度分析"卡片</li>
                <li>支持礼品码兑换和付费购买两种方式</li>
                <li>需要配置 DEEPSEEK_API_KEY 才能生成真实分析</li>
                <li>未配置 API 密钥时将使用模拟数据</li>
              </ul>
            </div>
          )}

          {!deepseekEnabled && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                关闭后，用户将无法看到任何与 AI 深度分析相关的功能和入口
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>其他设置</CardTitle>
          <CardDescription>
            更多系统配置选项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            更多设置功能即将推出...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;
