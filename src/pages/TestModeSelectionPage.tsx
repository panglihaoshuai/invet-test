import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';
import { testResultApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { Clock, Zap, Gamepad2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

const TestModeSelectionPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { setTestId, resetTest, setTestMode } = useTest();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast({
        title: '请先登录',
        description: '需要登录后才能开始测试',
        variant: 'destructive'
      });
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate, toast]);

  const startTest = async (mode: 'quick' | 'comprehensive') => {
    if (!user) return;

    try {
      // 重置之前的测试状态
      resetTest();

      // 创建新的测试记录
      const testResult = await testResultApi.createTestResult(user.id);

      if (testResult) {
        setTestId(testResult.id);
        setTestMode(mode);
        
        toast({
          title: mode === 'quick' ? '快速测试已开始' : '完整测试已开始',
          description: '请按顺序完成所有测试',
        });
        
        navigate('/test/personality');
      } else {
        throw new Error('创建测试失败');
      }
    } catch (error) {
      console.error('Start test error:', error);
      toast({
        title: '启动失败',
        description: '无法开始测试，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl xl:text-4xl font-bold gradient-text">
              选择测试模式
            </h1>
            <p className="text-muted-foreground">
              根据您的时间和需求，选择适合的测试模式
            </p>
          </div>
        </div>

        {/* Test Mode Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          {/* Quick Test */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">快速测试</CardTitle>
                  </div>
                  <CardDescription>适合快速了解投资风格</CardDescription>
                </div>
                <Badge variant="secondary">推荐</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">预计时间: 10-15 分钟</span>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">包含内容：</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>人格特质测试（50题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>交易特征评估（8题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>数学与金融能力测试（10题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>风险偏好测试（5题）</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>适合人群：</strong>想要快速了解自己投资风格的用户，或时间有限的用户。
                </p>
              </div>

              <Button 
                onClick={() => startTest('quick')}
                className="w-full btn-glow"
                size="lg"
              >
                开始快速测试
              </Button>
            </CardContent>
          </Card>

          {/* Comprehensive Test */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">完整测试</CardTitle>
                  </div>
                  <CardDescription>深度评估，包含互动游戏</CardDescription>
                </div>
                <Badge>专业版</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">预计时间: 20-30 分钟</span>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">包含内容：</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>人格特质测试（50题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>交易特征评估（8题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>数学与金融能力测试（10题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>风险偏好测试（5题）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-primary">🎈 气球游戏</strong> - 互动风险测试</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>特色亮点：</strong>通过趣味互动游戏，更准确地评估您在真实决策场景中的风险偏好和行为模式。
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>适合人群：</strong>希望获得更精准评估结果的用户，或对投资决策有深入了解需求的用户。
                </p>
              </div>

              <Button 
                onClick={() => startTest('comprehensive')}
                className="w-full btn-glow"
                size="lg"
              >
                开始完整测试
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>模式对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">特性</th>
                    <th className="text-center py-3 px-4">快速测试</th>
                    <th className="text-center py-3 px-4">完整测试</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">测试时间</td>
                    <td className="text-center py-3 px-4">10-15 分钟</td>
                    <td className="text-center py-3 px-4">20-30 分钟</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">人格测试</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">交易特征</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">金融能力</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">风险偏好</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">互动游戏</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4 text-primary font-medium">✓ 气球游戏</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">评估准确度</td>
                    <td className="text-center py-3 px-4">标准</td>
                    <td className="text-center py-3 px-4 text-primary font-medium">更精准</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestModeSelectionPage;
