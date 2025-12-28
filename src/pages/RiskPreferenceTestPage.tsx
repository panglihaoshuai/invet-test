import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTest } from '@/contexts/TestContext';
import { testResultApi } from '@/db/api';
import { riskPreferenceQuestions } from '@/data/questions';
import type { RiskPreferenceScores } from '@/types/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RiskPreferenceTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testId, testMode, setRiskPreferenceScores, progress, setProgress } = useTest();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // 检查是否完成了前两个测试
  React.useEffect(() => {
    if (
      !testId ||
      !progress.completed_tests.includes('personality') ||
      !progress.completed_tests.includes('math_finance')
    ) {
      toast({
        title: '请先完成前面的测试',
        description: '请按顺序完成测试',
        variant: 'destructive'
      });
      navigate('/test/personality');
    }
  }, [testId, progress, navigate, toast]);

  // 计算进度
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / riskPreferenceQuestions.length) * 100;

  // 处理答案选择
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 计算风险偏好分数
  const calculateScores = (): RiskPreferenceScores => {
    // r1: 投资方案选择 (0-3 对应风险等级 1-10)
    const r1Answer = answers['r1'] || 0;
    const riskFromR1 = [2, 4, 7, 9][r1Answer];

    // r2: 亏损反应 (0-3)
    const r2Answer = answers['r2'] || 0;
    const riskFromR2 = [2, 5, 7, 9][r2Answer];

    // r3: 投资期限
    const r3Answer = answers['r3'] || 0;
    const investmentHorizon = ['短期（1年以内）', '中期（2-5年）', '长期（5年以上）', '没有明确期限'][r3Answer];

    // r4: 最大亏损容忍度 (0-3)
    const r4Answer = answers['r4'] || 0;
    const riskFromR4 = [2, 5, 7, 9][r4Answer];

    // r5: 市场下跌反应 (0-3)
    const r5Answer = answers['r5'] || 0;
    const riskFromR5 = [1, 4, 7, 10][r5Answer];

    // 计算平均风险容忍度
    const riskTolerance = Math.round((riskFromR1 + riskFromR2 + riskFromR4 + riskFromR5) / 4);

    // 损失厌恶程度（基于r2和r5，分数越低越厌恶损失）
    const lossAversion = 10 - Math.round((riskFromR2 + riskFromR5) / 2);

    return {
      risk_tolerance: riskTolerance,
      investment_horizon: investmentHorizon,
      loss_aversion: lossAversion
    };
  };

  // 提交测试并生成报告
  const handleSubmit = async () => {
    if (answeredCount < riskPreferenceQuestions.length) {
      toast({
        title: '请完成所有题目',
        description: `还有 ${riskPreferenceQuestions.length - answeredCount} 道题未完成`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const scores = calculateScores();
      setRiskPreferenceScores(scores);

      // 更新数据库
      if (testId) {
        await testResultApi.updateTestResult(testId, {
          risk_preference_scores: scores
        });
      }

      // 更新进度
      setProgress({
        ...progress,
        current_step: 3,
        completed_tests: [...progress.completed_tests, 'risk_preference']
      });

      // 根据测试模式决定下一步
      if (testMode === 'comprehensive') {
        toast({
          title: '风险偏好测试完成',
          description: '接下来进行互动游戏测试',
        });
        navigate('/test/balloon-game');
      } else {
        toast({
          title: '所有测试完成',
          description: '正在生成您的投资策略报告',
        });
        navigate('/result');
      }
    } catch (error) {
      console.error('Submit risk preference test error:', error);
      toast({
        title: '提交失败',
        description: '无法保存测试结果，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">风险偏好评估</h1>
            <p className="text-muted-foreground">
              通过投资场景模拟，评估您的风险承受能力和投资偏好
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>测试进度</span>
                <span className="text-primary font-medium">
                  {answeredCount} / {riskPreferenceQuestions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {riskPreferenceQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id] !== undefined ? answers[question.id].toString() : ''}
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                >
                  <div className="space-y-3">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`${question.id}-${optionIndex}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < riskPreferenceQuestions.length}
            className="btn-glow"
          >
            完成测试并生成报告
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RiskPreferenceTestPage;
