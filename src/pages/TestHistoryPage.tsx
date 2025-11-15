import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { testResultApi } from '@/db/api';
import type { TestResult } from '@/types/types';
import { ChevronLeft, Calendar, TrendingUp, Eye, BarChart3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const TestHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      toast({
        title: '请先登录',
        description: '查看测试历史需要登录',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    loadTestHistory();
  }, [user, navigate, toast]);

  const loadTestHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const results = await testResultApi.getUserTestResults(user.id);
      // 按完成时间倒序排列
      const sortedResults = results.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      setTestHistory(sortedResults);
    } catch (error) {
      console.error('Load test history error:', error);
      toast({
        title: '加载失败',
        description: '无法加载测试历史，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (testId: string) => {
    navigate(`/test/history/${testId}`);
  };

  const handleCompare = () => {
    if (selectedTests.length !== 2) {
      toast({
        title: '请选择两个测试',
        description: '对比功能需要选择恰好两个测试结果',
        variant: 'destructive'
      });
      return;
    }
    navigate(`/test/compare?ids=${selectedTests.join(',')}`);
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else if (prev.length < 2) {
        return [...prev, testId];
      } else {
        toast({
          title: '最多选择两个测试',
          description: '请先取消选择一个测试',
          variant: 'destructive'
        });
        return prev;
      }
    });
  };

  const handleClearHistory = async () => {
    if (!user) return;

    try {
      const success = await testResultApi.deleteAllUserTestResults(user.id);
      if (success) {
        setTestHistory([]);
        setSelectedTests([]);
        toast({
          title: '清除成功',
          description: '所有测试历史已清除'
        });
      } else {
        toast({
          title: '清除失败',
          description: '无法清除测试历史，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Clear history error:', error);
      toast({
        title: '清除失败',
        description: '无法清除测试历史，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const getInvestmentStyleColor = (style: string | null) => {
    if (!style) return 'secondary';
    if (style.includes('趋势')) return 'default';
    if (style.includes('价值')) return 'default';
    if (style.includes('波段')) return 'default';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载测试历史中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">测试历史</h1>
              <p className="text-muted-foreground">
                查看您的历史测试记录，追踪投资风格的变化
              </p>
            </div>
            <div className="flex gap-2">
              {testHistory.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <Trash2 className="mr-2 h-4 w-4" />
                      清除历史
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认清除测试历史？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将永久删除所有测试历史记录，无法恢复。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>
                        确认清除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {selectedTests.length === 2 && (
                <Button onClick={handleCompare} className="btn-glow">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  对比选中的测试
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总测试次数</p>
                  <p className="text-2xl font-bold">{testHistory.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">最近测试</p>
                  <p className="text-lg font-medium">
                    {testHistory.length > 0
                      ? format(new Date(testHistory[0].completed_at), 'yyyy年MM月dd日', { locale: zhCN })
                      : '暂无记录'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">当前投资风格</p>
                  <p className="text-lg font-medium">
                    {testHistory.length > 0 && testHistory[0].investment_style
                      ? testHistory[0].investment_style
                      : '暂无数据'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test History List */}
        {testHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无测试记录</h3>
                <p className="text-muted-foreground mb-6">
                  开始您的第一次投资风格评估
                </p>
                <Button onClick={() => navigate('/login')}>
                  开始测试
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">历史记录</h2>
            {testHistory.map((test, index) => (
              <Card
                key={test.id}
                className={`transition-all ${
                  selectedTests.includes(test.id)
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          测试 #{testHistory.length - index}
                        </CardTitle>
                        {index === 0 && (
                          <Badge variant="default">最新</Badge>
                        )}
                        {test.investment_style && (
                          <Badge variant={getInvestmentStyleColor(test.investment_style)}>
                            {test.investment_style}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(test.completed_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedTests.includes(test.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleTestSelection(test.id)}
                      >
                        {selectedTests.includes(test.id) ? '已选择' : '选择对比'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResult(test.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {test.personality_scores && (
                      <div>
                        <p className="text-muted-foreground mb-1">人格特质</p>
                        <div className="space-y-1">
                          <p>开放性: {test.personality_scores.openness.toFixed(1)}</p>
                          <p>尽责性: {test.personality_scores.conscientiousness.toFixed(1)}</p>
                        </div>
                      </div>
                    )}
                    {test.math_finance_scores && (
                      <div>
                        <p className="text-muted-foreground mb-1">金融能力</p>
                        <p className="text-lg font-medium">
                          {test.math_finance_scores.correct_answers}/{test.math_finance_scores.total_questions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          正确率 {test.math_finance_scores.percentage.toFixed(0)}%
                        </p>
                      </div>
                    )}
                    {test.risk_preference_scores && (
                      <div>
                        <p className="text-muted-foreground mb-1">风险偏好</p>
                        <p className="text-lg font-medium">
                          {test.risk_preference_scores.risk_tolerance <= 3 && '保守型'}
                          {test.risk_preference_scores.risk_tolerance > 3 && test.risk_preference_scores.risk_tolerance <= 5 && '稳健型'}
                          {test.risk_preference_scores.risk_tolerance > 5 && test.risk_preference_scores.risk_tolerance <= 7 && '平衡型'}
                          {test.risk_preference_scores.risk_tolerance > 7 && '积极型'}
                        </p>
                      </div>
                    )}
                    {test.euclidean_distance !== null && (
                      <div>
                        <p className="text-muted-foreground mb-1">匹配度</p>
                        <p className="text-lg font-medium">
                          {test.euclidean_distance.toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistoryPage;
