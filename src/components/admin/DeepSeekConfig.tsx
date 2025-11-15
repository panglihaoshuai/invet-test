import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/db/adminApi';
import {
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react';

const DeepSeekConfig: React.FC = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    setLoading(true);
    try {
      const key = await adminApi.getDeepSeekApiKey();
      if (key) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      toast({
        title: '加载失败',
        description: '无法加载 DeepSeek API 密钥',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: '输入错误',
        description: '请输入 API 密钥',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const success = await adminApi.setDeepSeekApiKey(apiKey.trim());
      
      if (success) {
        toast({
          title: '保存成功',
          description: 'DeepSeek API 密钥已保存'
        });
        setTestResult(null);
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: '保存失败',
        description: '无法保存 DeepSeek API 密钥',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast({
        title: '输入错误',
        description: '请输入 API 密钥',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await adminApi.testDeepSeekApiKey(apiKey.trim());
      setTestResult(result);
      
      toast({
        title: result.success ? '测试成功' : '测试失败',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResult({
        success: false,
        message: '测试过程中发生错误'
      });
      toast({
        title: '测试失败',
        description: '测试过程中发生错误',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          DeepSeek API 配置
        </CardTitle>
        <CardDescription>
          配置 DeepSeek API 密钥，用于生成投资策略分析报告
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API 密钥输入 */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API 密钥</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            从 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DeepSeek 平台</a> 获取 API 密钥
          </p>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            testResult.success 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-red-500/10 text-red-500'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{testResult.message}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={handleTest}
            disabled={testing || saving || !apiKey.trim()}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                测试连接
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving || testing || !apiKey.trim()}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                保存密钥
              </>
            )}
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">使用说明</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>DeepSeek API 用于生成个性化的投资策略分析报告</li>
            <li>API 密钥将安全存储在数据库中，仅管理员可见</li>
            <li>建议先测试连接，确认密钥有效后再保存</li>
            <li>如需更换密钥，直接输入新密钥并保存即可</li>
          </ul>
        </div>

        {/* API 状态 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">API 状态</span>
          {apiKey ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              已配置
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              未配置
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeepSeekConfig;
