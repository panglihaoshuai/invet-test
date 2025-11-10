import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTest } from '@/contexts/TestContext';
import { testResultApi } from '@/db/api';
import { tradingCharacteristicsQuestions } from '@/data/questions';
import type { TradingCharacteristics } from '@/types/types';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

const TradingCharacteristicsTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testId, setTradingCharacteristics, progress, setProgress } = useTest();
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});

  // 检查是否完成了人格测试
  React.useEffect(() => {
    if (!testId || !progress.completed_tests.includes('personality')) {
      toast({
        title: '请先完成人格测试',
        description: '请按顺序完成测试',
        variant: 'destructive'
      });
      navigate('/test/personality');
    }
  }, [testId, progress, navigate, toast]);

  // 计算进度
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / tradingCharacteristicsQuestions.length) * 100;

  // 处理单选答案
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 处理多选答案
  const handleMultipleAnswerChange = (questionId: string, optionIndex: number, checked: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = (prev[questionId] as number[]) || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionIndex].sort()
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(idx => idx !== optionIndex)
        };
      }
    });
  };

  // 生成交易特征分析
  const generateCharacteristics = (): TradingCharacteristics => {
    const t7Answer = answers['t7'] as number[];
    const learningStyle = t7Answer && t7Answer.length > 0
      ? t7Answer.map(idx => tradingCharacteristicsQuestions[6].options?.[idx] || '').join('、')
      : '';

    const characteristics: TradingCharacteristics = {
      trading_frequency: tradingCharacteristicsQuestions[0].options?.[answers['t1'] as number || 0] || '',
      preferred_instruments: tradingCharacteristicsQuestions[1].options?.[answers['t2'] as number || 0] || '',
      analysis_method: tradingCharacteristicsQuestions[2].options?.[answers['t3'] as number || 0] || '',
      technical_preference: tradingCharacteristicsQuestions[3].options?.[answers['t4'] as number || 0] || '',
      decision_basis: tradingCharacteristicsQuestions[4].options?.[answers['t5'] as number || 0] || '',
      investment_philosophy: tradingCharacteristicsQuestions[5].options?.[answers['t6'] as number || 0] || '',
      learning_style: learningStyle,
      portfolio_approach: tradingCharacteristicsQuestions[7].options?.[answers['t8'] as number || 0] || ''
    };

    return characteristics;
  };

  // 提交测试
  const handleSubmit = async () => {
    if (answeredCount < tradingCharacteristicsQuestions.length) {
      toast({
        title: '请完成所有题目',
        description: `还有 ${tradingCharacteristicsQuestions.length - answeredCount} 道题未完成`,
        variant: 'destructive'
      });
      return;
    }

    // 检查多选题是否至少选择了一项
    const t7Answer = answers['t7'] as number[];
    if (!t7Answer || t7Answer.length === 0) {
      toast({
        title: '请完成所有题目',
        description: '第7题至少需要选择一项',
        variant: 'destructive'
      });
      return;
    }

    try {
      const characteristics = generateCharacteristics();
      setTradingCharacteristics(characteristics);

      // 更新数据库
      if (testId) {
        await testResultApi.updateTestResult(testId, {
          trading_characteristics: characteristics
        });
      }

      // 更新进度
      setProgress({
        ...progress,
        current_step: 2,
        completed_tests: [...progress.completed_tests, 'trading_characteristics']
      });

      toast({
        title: '交易特征评估完成',
        description: '正在进入数学金融能力测试',
      });

      navigate('/test/math-finance');
    } catch (error) {
      console.error('Submit trading characteristics test error:', error);
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
            <h1 className="text-3xl font-bold gradient-text mb-2">交易特征评估</h1>
            <p className="text-muted-foreground">
              了解您的交易习惯、偏好和投资理念
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
                  {answeredCount} / {tradingCharacteristicsQuestions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {tradingCharacteristicsQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-1">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg flex-1">
                    {index + 1}. {question.text}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {question.type === 'multiple_select' ? (
                  // 多选题
                  <div className="space-y-3">
                    {question.options?.map((option, optionIndex) => {
                      const isChecked = ((answers[question.id] as number[]) || []).includes(optionIndex);
                      return (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${optionIndex}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleMultipleAnswerChange(question.id, optionIndex, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`${question.id}-${optionIndex}`}
                            className="cursor-pointer flex-1"
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // 单选题
                  <RadioGroup
                    value={(answers[question.id] as number)?.toString()}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < tradingCharacteristicsQuestions.length}
            className="btn-glow"
          >
            完成并继续
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TradingCharacteristicsTestPage;
