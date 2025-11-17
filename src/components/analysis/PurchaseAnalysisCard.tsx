import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Loader2, CreditCard, TrendingDown, Gift, Ticket } from 'lucide-react';
import { paymentApi } from '@/db/api';
import { adminApi } from '@/db/adminApi';
import { giftCodeApi } from '@/db/giftCodeApi';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/types/types';

interface PurchaseAnalysisCardProps {
  testResultId: string;
  onPurchaseComplete?: () => void;
  paymentEnabled?: boolean;
}

const PurchaseAnalysisCard = ({ testResultId, onPurchaseComplete, paymentEnabled = true }: PurchaseAnalysisCardProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [price, setPrice] = useState(3.99);
  const [completedAnalyses, setCompletedAnalyses] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [freeAnalyses, setFreeAnalyses] = useState(0);
  const [showGiftCodeInput, setShowGiftCodeInput] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);

  useEffect(() => {
    loadPricingInfo();
    loadFreeAnalyses();
  }, []);

  const loadPricingInfo = async () => {
    try {
      const pricingInfo = await adminApi.getCurrentUserPricingInfo();
      if (pricingInfo) {
        setPrice(pricingInfo.next_price / 100);
        setCompletedAnalyses(pricingInfo.completed_analyses);
      }
    } catch (error) {
      console.error('Error loading pricing info:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  const loadFreeAnalyses = async () => {
    try {
      const count = await giftCodeApi.getUserFreeAnalyses();
      setFreeAnalyses(count);
    } catch (error) {
      console.error('Error loading free analyses:', error);
    }
  };

  const handleRedeemGiftCode = async () => {
    if (!giftCode.trim()) {
      toast({
        title: '请输入礼品码',
        variant: 'destructive'
      });
      return;
    }

    setRedeemingCode(true);
    try {
      const result = await giftCodeApi.redeemGiftCode(giftCode.trim());
      
      if (result.success) {
        toast({
          title: '兑换成功！',
          description: result.message
        });
        setGiftCode('');
        setShowGiftCodeInput(false);
        await loadFreeAnalyses();
      } else {
        toast({
          title: '兑换失败',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error redeeming gift code:', error);
      toast({
        title: '兑换失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setRedeemingCode(false);
    }
  };

  const handleUseFreeAnalysis = async () => {
    setIsProcessing(true);
    try {
      const success = await giftCodeApi.consumeFreeAnalysis();
      
      if (success) {
        toast({
          title: '使用成功',
          description: '正在为您生成分析报告...'
        });
        
        if (onPurchaseComplete) {
          onPurchaseComplete();
        }
      } else {
        throw new Error('使用免费次数失败');
      }
    } catch (error) {
      console.error('Error using free analysis:', error);
      toast({
        title: '使用失败',
        description: '无法使用免费次数，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriceLabel = () => {
    if (completedAnalyses === 0) {
      return '首次购买';
    } else if (completedAnalyses === 1) {
      return '第二次购买';
    } else {
      return '老用户优惠';
    }
  };

  const handlePurchase = async () => {
    if (!paymentEnabled) {
      toast({
        title: '支付已关闭',
        description: '当前支付接口处于关闭状态，请使用礼品码或稍后再试',
        variant: 'destructive'
      });
      return;
    }
    setIsProcessing(true);

    try {
      const items: OrderItem[] = [
        {
          name: 'DeepSeek AI 专业投资心理分析报告',
          price: price,
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
          {/* 免费次数显示 */}
          {freeAnalyses > 0 && (
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 border border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">您有免费分析次数</span>
                </div>
                <Badge variant="default" className="bg-primary">
                  剩余 {freeAnalyses} 次
                </Badge>
              </div>
              <Button
                onClick={handleUseFreeAnalysis}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    免费获取深度分析
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                使用礼品码免费次数，无需支付
              </p>
            </div>
          )}

          {/* 礼品码兑换 */}
          {!showGiftCodeInput && freeAnalyses === 0 && (
            <Button
              variant="outline"
              onClick={() => setShowGiftCodeInput(true)}
              className="w-full"
            >
              <Ticket className="mr-2 h-4 w-4" />
              有礼品码？点击兑换
            </Button>
          )}

          {showGiftCodeInput && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">兑换礼品码</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="输入礼品码"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="font-mono"
                />
                <Button
                  onClick={handleRedeemGiftCode}
                  disabled={redeemingCode || !giftCode.trim()}
                >
                  {redeemingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    '兑换'
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGiftCodeInput(false);
                  setGiftCode('');
                }}
                className="w-full"
              >
                取消
              </Button>
            </div>
          )}

          {/* 付费购买选项 */}
          {freeAnalyses === 0 && paymentEnabled && (
            <>
              {loadingPrice ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold">¥{price.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground ml-2">一次性付费</span>
                    </div>
                    <div className="text-right">
                      {completedAnalyses > 0 && (
                        <Badge variant="secondary" className="gap-1 mb-1">
                          <TrendingDown className="h-3 w-3" />
                          {getPriceLabel()}
                        </Badge>
                      )}
                      {completedAnalyses === 0 && (
                        <>
                          <p className="text-sm text-muted-foreground line-through">原价 ¥19.99</p>
                          <p className="text-sm font-medium text-primary">限时 80% OFF</p>
                        </>
                      )}
                      {completedAnalyses === 1 && (
                        <p className="text-sm font-medium text-primary">再降 ¥1.00</p>
                      )}
                      {completedAnalyses >= 2 && (
                        <p className="text-sm font-medium text-primary">最低价格</p>
                      )}
                    </div>
                  </div>

                  {completedAnalyses > 0 && (
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <p className="text-primary font-medium">🎉 老用户专享优惠</p>
                      <p className="text-muted-foreground mt-1">
                        {completedAnalyses === 1 
                          ? '第二次购买享受优惠价，下次更低至 ¥0.99！' 
                          : '您已享受最低价格，感谢您的持续支持！'}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing || loadingPrice}
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
                </>
              )}

              <p className="text-xs text-center text-muted-foreground">
                支持 Visa、Mastercard、支付宝等多种支付方式
              </p>
            </>
          )}

          {/* 支付关闭提示 */}
          {freeAnalyses === 0 && !paymentEnabled && (
            <div className="rounded-lg p-4 border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">支付功能已关闭</span>
              </div>
              <p className="text-sm text-muted-foreground">
                管理员已关闭支付接口。您可以使用礼品码兑换免费分析，或稍后再试。
              </p>
            </div>
          )}
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
