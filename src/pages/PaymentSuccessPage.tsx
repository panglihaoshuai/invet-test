import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { paymentApi, deepseekApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('缺少支付会话ID');
      setIsVerifying(false);
      return;
    }

    verifyPaymentAndGenerateAnalysis(sessionId);
  }, [searchParams]);

  const verifyPaymentAndGenerateAnalysis = async (sessionId: string) => {
    try {
      setIsVerifying(true);
      
      // 验证支付
      const paymentResult = await paymentApi.verifyPayment(sessionId);
      
      if (!paymentResult || !paymentResult.verified) {
        setError('支付验证失败，请联系客服');
        setIsVerifying(false);
        return;
      }

      setPaymentData(paymentResult);
      setPaymentVerified(true);
      setIsVerifying(false);

      toast({
        title: '支付成功',
        description: '正在生成您的专属分析报告...'
      });

      // 生成DeepSeek分析
      await generateAnalysis(sessionId);
    } catch (err) {
      console.error('Payment verification error:', err);
      setError('支付验证过程中出现错误');
      setIsVerifying(false);
    }
  };

  const generateAnalysis = async (sessionId: string) => {
    try {
      setIsGenerating(true);

      // 从订单中获取test_result_id
      const { data: order } = await paymentApi.verifyPayment(sessionId);
      
      if (!order || !order.orderUpdated) {
        throw new Error('无法获取订单信息');
      }

      // 这里需要从订单元数据中获取test_result_id
      // 暂时先跳过，在ResultPage中处理
      
      setIsGenerating(false);
      
      toast({
        title: '分析生成成功',
        description: '您可以在测试结果页面查看详细分析'
      });

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate('/test/history');
      }, 2000);
    } catch (err) {
      console.error('Analysis generation error:', err);
      setIsGenerating(false);
      toast({
        title: '分析生成失败',
        description: '请稍后在测试结果页面重试',
        variant: 'destructive'
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在验证支付...
            </CardTitle>
            <CardDescription>
              请稍候，我们正在确认您的支付状态
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              支付验证失败
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/test/history')}>
                返回测试历史
              </Button>
              <Button onClick={() => navigate('/')}>
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            支付成功！
          </CardTitle>
          <CardDescription>
            感谢您的购买，您的专属分析报告正在生成中
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentData && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">支付金额</span>
                <span className="font-medium">
                  ¥{(paymentData.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">支付方式</span>
                <span className="font-medium">Stripe</span>
              </div>
              {paymentData.customerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">邮箱</span>
                  <span className="font-medium">{paymentData.customerEmail}</span>
                </div>
              )}
            </div>
          )}

          {isGenerating ? (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>正在生成分析报告</AlertTitle>
              <AlertDescription>
                DeepSeek AI 正在为您生成专业的投资心理分析，请稍候...
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>准备就绪</AlertTitle>
              <AlertDescription>
                您可以在测试历史页面查看详细的分析报告
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              返回首页
            </Button>
            <Button 
              onClick={() => navigate('/test/history')}
              className="flex-1"
              disabled={isGenerating}
            >
              查看分析报告
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
