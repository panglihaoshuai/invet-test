import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { testResultApi } from '@/db/api';
import type { TestResult } from '@/types/types';
import { ChevronLeft, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PersonalityChart from '@/components/PersonalityChart';
import InvestmentRecommendation from '@/components/InvestmentRecommendation';

const HistoricalResultPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) {
      navigate('/test/history');
      return;
    }

    loadTestResult();
  }, [testId, navigate]);

  const loadTestResult = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      const result = await testResultApi.getTestResult(testId);
      if (!result) {
        toast({
          title: '测试结果不存在',
          description: '无法找到该测试记录',
          variant: 'destructive'
        });
        navigate('/test/history');
        return;
      }
      setTestResult(result);
    } catch (error) {
      console.error('Load test result error:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载测试结果中...</p>
        </div>
      </div>
    );
  }

  if (!testResult) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">测试结果详情</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(testResult.completed_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              下载报告
            </Button>
          </div>
        </div>

        {/* Investment Style */}
        {testResult.investment_style && (
          <Card>
            <CardHeader>
              <CardTitle>推荐投资风格</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold gradient-text mb-2">
                  {testResult.investment_style}
                </h2>
                {testResult.euclidean_distance !== null && (
                  <p className="text-muted-foreground">
                    匹配度: {testResult.euclidean_distance.toFixed(0)}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Scores */}
        {testResult.personality_scores && (
          <Card>
            <CardHeader>
              <CardTitle>人格特质分析</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalityChart scores={testResult.personality_scores} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">开放性</span>
                    <span className="font-medium">{testResult.personality_scores.openness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">尽责性</span>
                    <span className="font-medium">{testResult.personality_scores.conscientiousness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">外向性</span>
                    <span className="font-medium">{testResult.personality_scores.extraversion.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">宜人性</span>
                    <span className="font-medium">{testResult.personality_scores.agreeableness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">神经质</span>
                    <span className="font-medium">{testResult.personality_scores.neuroticism.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trading Characteristics */}
        {testResult.trading_characteristics && (
          <Card>
            <CardHeader>
              <CardTitle>交易特征</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">交易频率</p>
                  <p className="font-medium">{testResult.trading_characteristics.trading_frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">偏好标的</p>
                  <p className="font-medium">{testResult.trading_characteristics.preferred_instruments}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">分析方法</p>
                  <p className="font-medium">{testResult.trading_characteristics.analysis_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">投资理念</p>
                  <p className="font-medium">{testResult.trading_characteristics.investment_philosophy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">学习方式</p>
                  <p className="font-medium">{testResult.trading_characteristics.learning_style}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">组合策略</p>
                  <p className="font-medium">{testResult.trading_characteristics.portfolio_approach}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Math Finance Scores */}
        {testResult.math_finance_scores && (
          <Card>
            <CardHeader>
              <CardTitle>数学与金融能力</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {testResult.math_finance_scores.correct_answers}
                  </p>
                  <p className="text-sm text-muted-foreground">答对题数</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {testResult.math_finance_scores.percentage.toFixed(0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">正确率</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {testResult.math_finance_scores.total_questions}
                  </p>
                  <p className="text-sm text-muted-foreground">总题数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Preference */}
        {testResult.risk_preference_scores && (
          <Card>
            <CardHeader>
              <CardTitle>风险偏好</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <h3 className="text-2xl font-bold mb-2">
                  {testResult.risk_preference_scores.risk_tolerance <= 3 && '保守型投资者'}
                  {testResult.risk_preference_scores.risk_tolerance > 3 && testResult.risk_preference_scores.risk_tolerance <= 5 && '稳健型投资者'}
                  {testResult.risk_preference_scores.risk_tolerance > 5 && testResult.risk_preference_scores.risk_tolerance <= 7 && '平衡型投资者'}
                  {testResult.risk_preference_scores.risk_tolerance > 7 && '积极型投资者'}
                </h3>
                <p className="text-muted-foreground">
                  风险承受能力评分: {testResult.risk_preference_scores.risk_tolerance}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Recommendation */}
        {testResult.investment_style && (
          <InvestmentRecommendation investmentStyle={testResult.investment_style} />
        )}
      </div>
    </div>
  );
};

export default HistoricalResultPage;
