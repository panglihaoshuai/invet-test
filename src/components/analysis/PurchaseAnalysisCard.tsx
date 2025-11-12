import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { paymentApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/types/types';

interface PurchaseAnalysisCardProps {
  testResultId: string;
  onPurchaseComplete?: () => void;
}

const PurchaseAnalysisCard = ({ testResultId, onPurchaseComplete }: PurchaseAnalysisCardProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      const items: OrderItem[] = [
        {
          name: 'DeepSeek AI 专业投资心理分析报告',
          price: 3.99,
          quantity: 1,
          image_url: 'https://resource-static.cdn.bcebos.com/img/deepseek-analysis.png'
        }
      ];

      const result = await paymentApi.createCheckoutSession(items, testResultId);

      if (!result) {
        throw new Error('创建支付会话失败');
      }

      // 在新标签页打开Stripe支付页面
      window.open(result.url, '_blank');

      toast({
        title: '支付页面已打开',
        description: '请在新窗口中完成支付'
      });

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: '支付失败',
        description: error instanceof Error ? error.message : '创建支付会话时出现错误',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>解锁 AI 深度分析</CardTitle>
          </div>
          <Badge variant="default" className="bg-primary">
            限时优惠
          </Badge>
        </div>
        <CardDescription>
          获取由 DeepSeek AI 生成的专业投资心理分析报告
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 功能列表 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">投资人格深度画像</p>
              <p className="text-sm text-muted-foreground">
                基于 Big Five 人格模型的专业分析
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">个性化投资策略建议</p>
              <p className="text-sm text-muted-foreground">
                3-5 个具体可执行的投资建议
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">行为偏差预警与纠正</p>
              <p className="text-sm text-muted-foreground">
                识别并克服投资中的心理陷阱
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">长期发展路径规划</p>
              <p className="text-sm text-muted-foreground">
                投资能力提升的阶段性目标
              </p>
            </div>
          </div>
        </div>

        {/* 价格和购买按钮 */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold">¥3.99</span>
              <span className="text-sm text-muted-foreground ml-2">一次性付费</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground line-through">原价 ¥19.99</p>
              <p className="text-sm font-medium text-primary">限时 80% OFF</p>
            </div>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            size="lg"
            className="w-full btn-glow"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                立即购买深度分析
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            支持 Visa、Mastercard、支付宝等多种支付方式
          </p>
        </div>

        {/* 说明 */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• 分析报告由 DeepSeek AI 实时生成，字数约 1500-2500 字</p>
          <p>• 购买后永久保存，可随时查看</p>
          <p>• 支持安全的在线支付，数据加密传输</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseAnalysisCard;
