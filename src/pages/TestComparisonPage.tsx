import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { testResultApi } from '@/db/api';
import type { TestResult } from '@/types/types';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const TestComparisonPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [test1, setTest1] = useState<TestResult | null>(null);
  const [test2, setTest2] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (!ids) {
      toast({
        title: '参数错误',
        description: '请从历史记录页面选择两个测试进行对比',
        variant: 'destructive'
      });
      navigate('/test/history');
      return;
    }

    const [id1, id2] = ids.split(',');
    if (!id1 || !id2) {
      toast({
        title: '参数错误',
        description: '请选择两个测试进行对比',
        variant: 'destructive'
      });
      navigate('/test/history');
      return;
    }

    loadTestResults(id1, id2);
  }, [searchParams, navigate, toast]);

  const loadTestResults = async (id1: string, id2: string) => {
    try {
      setLoading(true);
      const [result1, result2] = await Promise.all([
        testResultApi.getTestResult(id1),
        testResultApi.getTestResult(id2)
      ]);

      if (!result1 || !result2) {
        toast({
          title: '加载失败',
          description: '无法找到测试记录',
          variant: 'destructive'
        });
        navigate('/test/history');
        return;
      }

      // 确保 test1 是较早的测试，test2 是较新的测试
      if (new Date(result1.completed_at) > new Date(result2.completed_at)) {
        setTest1(result2);
        setTest2(result1);
      } else {
        setTest1(result1);
        setTest2(result2);
      }
    } catch (error) {
      console.error('Load test results error:', error);
      toast({
        title: '加载失败',
        description: '无法加载测试结果，请稍后重试',
        variant: 'destructive'
      });
      navigate('/test/history');
    } finally {
      setLoading(false);
    }
  };

  const renderChangeIndicator = (oldValue: number, newValue: number, higherIsBetter = true) => {
    const diff = newValue - oldValue;
    const percentChange = oldValue !== 0 ? (diff / oldValue) * 100 : 0;

    if (Math.abs(diff) < 0.1) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-sm">无变化</span>
        </div>
      );
    }

    const isPositive = higherIsBetter ? diff > 0 : diff < 0;

    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {diff > 0 ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {diff > 0 ? '+' : ''}{diff.toFixed(1)} ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载对比数据中...</p>
        </div>
      </div>
    );
  }

  if (!test1 || !test2) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/test/history')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回历史记录
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">测试对比</h1>
            <p className="text-muted-foreground">
              对比两次测试结果，了解您的投资风格变化
            </p>
          </div>
        </div>

        {/* Test Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">测试 1（较早）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(test1.completed_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </div>
                {test1.investment_style && (
                  <div>
                    <p className="text-sm text-muted-foreground">投资风格</p>
                    <p className="font-medium">{test1.investment_style}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">测试 2（较新）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(test2.completed_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </div>
                {test2.investment_style && (
                  <div>
                    <p className="text-sm text-muted-foreground">投资风格</p>
                    <p className="font-medium">{test2.investment_style}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personality Comparison */}
        {test1.personality_scores && test2.personality_scores && (
          <Card>
            <CardHeader>
              <CardTitle>人格特质对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'openness', label: '开放性' },
                  { key: 'conscientiousness', label: '尽责性' },
                  { key: 'extraversion', label: '外向性' },
                  { key: 'agreeableness', label: '宜人性' },
                  { key: 'neuroticism', label: '神经质' }
                ].map(({ key, label }) => {
                  const oldValue = test1.personality_scores![key as keyof typeof test1.personality_scores];
                  const newValue = test2.personality_scores![key as keyof typeof test2.personality_scores];
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-24">{label}</span>
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-16 text-right text-sm text-muted-foreground">
                            {oldValue.toFixed(1)}
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/30"
                              style={{ width: `${(oldValue / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-4 text-center text-muted-foreground">→</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(newValue / 5) * 100}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm font-medium">
                            {newValue.toFixed(1)}
                          </div>
                        </div>
                        <div className="w-32">
                          {renderChangeIndicator(oldValue, newValue, key !== 'neuroticism')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Math Finance Comparison */}
        {test1.math_finance_scores && test2.math_finance_scores && (
          <Card>
            <CardHeader>
              <CardTitle>数学与金融能力对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">正确题数</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {test1.math_finance_scores.correct_answers}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-2xl font-bold text-primary">
                      {test2.math_finance_scores.correct_answers}
                    </span>
                  </div>
                  {renderChangeIndicator(
                    test1.math_finance_scores.correct_answers,
                    test2.math_finance_scores.correct_answers
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">正确率</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {test1.math_finance_scores.percentage.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-2xl font-bold text-primary">
                      {test2.math_finance_scores.percentage.toFixed(0)}%
                    </span>
                  </div>
                  {renderChangeIndicator(
                    test1.math_finance_scores.percentage,
                    test2.math_finance_scores.percentage
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">总题数</p>
                  <div className="text-center">
                    <span className="text-2xl font-bold">
                      {test1.math_finance_scores.total_questions}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Preference Comparison */}
        {test1.risk_preference_scores && test2.risk_preference_scores && (
          <Card>
            <CardHeader>
              <CardTitle>风险偏好对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">风险类型</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-medium text-muted-foreground">
                      {test1.risk_preference_scores.risk_tolerance <= 3 && '保守型'}
                      {test1.risk_preference_scores.risk_tolerance > 3 && test1.risk_preference_scores.risk_tolerance <= 5 && '稳健型'}
                      {test1.risk_preference_scores.risk_tolerance > 5 && test1.risk_preference_scores.risk_tolerance <= 7 && '平衡型'}
                      {test1.risk_preference_scores.risk_tolerance > 7 && '积极型'}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-xl font-bold text-primary">
                      {test2.risk_preference_scores.risk_tolerance <= 3 && '保守型'}
                      {test2.risk_preference_scores.risk_tolerance > 3 && test2.risk_preference_scores.risk_tolerance <= 5 && '稳健型'}
                      {test2.risk_preference_scores.risk_tolerance > 5 && test2.risk_preference_scores.risk_tolerance <= 7 && '平衡型'}
                      {test2.risk_preference_scores.risk_tolerance > 7 && '积极型'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">风险承受能力评分</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {test1.risk_preference_scores.risk_tolerance}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-2xl font-bold text-primary">
                      {test2.risk_preference_scores.risk_tolerance}
                    </span>
                  </div>
                  {renderChangeIndicator(
                    test1.risk_preference_scores.risk_tolerance,
                    test2.risk_preference_scores.risk_tolerance
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Style Change */}
        {test1.investment_style && test2.investment_style && (
          <Card>
            <CardHeader>
              <CardTitle>投资风格变化</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="flex items-center justify-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">之前</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {test1.investment_style}
                    </p>
                  </div>
                  <div className="text-3xl text-muted-foreground">→</div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">现在</p>
                    <p className="text-2xl font-bold gradient-text">
                      {test2.investment_style}
                    </p>
                  </div>
                </div>
                {test1.investment_style !== test2.investment_style && (
                  <p className="text-sm text-muted-foreground mt-4">
                    您的投资风格发生了变化，建议重新审视您的投资策略
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestComparisonPage;
