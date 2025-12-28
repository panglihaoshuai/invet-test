import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { giftCodeApi } from '@/db/giftCodeApi';
import type { GiftCodeStats } from '@/types/types';
import {
  Gift,
  Plus,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';

const GiftCodeManager: React.FC = () => {
  const { toast } = useToast();
  const [giftCodes, setGiftCodes] = useState<GiftCodeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [freeAnalysesCount, setFreeAnalysesCount] = useState(15);

  useEffect(() => {
    loadGiftCodes();
  }, []);

  const loadGiftCodes = async () => {
    setLoading(true);
    try {
      const codes = await giftCodeApi.getAllGiftCodes();
      setGiftCodes(codes);
    } catch (error) {
      console.error('Error loading gift codes:', error);
      toast({
        title: '加载失败',
        description: '无法加载礼品码列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const newCode = await giftCodeApi.generateGiftCode(maxRedemptions, expiresInDays, freeAnalysesCount);
      
      if (newCode) {
        toast({
          title: '生成成功',
          description: `礼品码 ${newCode.code} 已生成`
        });
        await loadGiftCodes();
        
        // 重置表单
        setMaxRedemptions(1);
        setExpiresInDays(undefined);
        setFreeAnalysesCount(15);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: '生成失败',
        description: '无法生成礼品码，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: '已复制',
      description: `礼品码 ${code} 已复制到剪贴板`
    });
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      const success = isActive 
        ? await giftCodeApi.deactivateGiftCode(codeId)
        : await giftCodeApi.activateGiftCode(codeId);

      if (success) {
        toast({
          title: isActive ? '已停用' : '已激活',
          description: `礼品码已${isActive ? '停用' : '激活'}`
        });
        await loadGiftCodes();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('Error toggling code:', error);
      toast({
        title: '操作失败',
        description: '无法更改礼品码状态',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '永久有效';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
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
    <div className="space-y-6">
      {/* 生成礼品码 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            生成礼品码
          </CardTitle>
          <CardDescription>
            创建新的礼品码，每个礼品码可提供 15 次免费分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxRedemptions">最大使用次数</Label>
              <Input
                id="maxRedemptions"
                type="number"
                min="1"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                此礼品码可以被多少个用户使用
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresInDays">有效期（天）</Label>
              <Input
                id="expiresInDays"
                type="number"
                min="1"
                value={expiresInDays || ''}
                onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="留空表示永久有效"
              />
              <p className="text-xs text-muted-foreground">
                留空表示永久有效
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeAnalysesCount">每用户免费分析次数</Label>
              <Input
                id="freeAnalysesCount"
                type="number"
                min="1"
                value={freeAnalysesCount}
                onChange={(e) => setFreeAnalysesCount(parseInt(e.target.value) || 1)}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">每位兑换此码的用户可获得的免费次数</p>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateCode}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    生成礼品码
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 礼品码列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            礼品码列表
          </CardTitle>
          <CardDescription>
            管理所有已生成的礼品码
          </CardDescription>
        </CardHeader>
        <CardContent>
          {giftCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>还没有生成任何礼品码</p>
            </div>
          ) : (
            <div className="space-y-4">
              {giftCodes.map((code) => (
                <div
                  key={code.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold bg-muted px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {code.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            有效
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            已停用
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {code.free_analyses_count} 次免费分析
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {code.current_redemptions} / {code.max_redemptions} 已使用
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(code.expires_at)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={code.is_active ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleActive(code.id, code.is_active)}
                    >
                      {code.is_active ? '停用' : '激活'}
                    </Button>
                  </div>

                  {code.total_remaining_analyses > 0 && (
                    <div className="bg-primary/10 rounded p-2 text-sm">
                      <p className="text-primary font-medium">
                        剩余 {code.total_remaining_analyses} 次免费分析待使用
                      </p>
                    </div>
                  )}

                  {code.created_by_email && (
                    <p className="text-xs text-muted-foreground">
                      创建者: {code.created_by_email} · {formatDate(code.created_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCodeManager;
