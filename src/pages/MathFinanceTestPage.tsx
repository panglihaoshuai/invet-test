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
import { mathFinanceQuestions, mathFinanceAnswers } from '@/data/questions';
import type { MathFinanceScores } from '@/types/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MathFinanceTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testId, setMathFinanceScores, progress, setProgress } = useTest();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // 检查是否完成了前面的测试
  React.useEffect(() => {
    if (
      !testId ||
      !progress.completed_tests.includes('personality') ||
      !progress.completed_tests.includes('trading_characteristics')
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
  const progressPercentage = (answeredCount / mathFinanceQuestions.length) * 100;

  // 处理答案选择
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 计算分数
  const calculateScores = (): MathFinanceScores => {
    let correctAnswers = 0;

    mathFinanceQuestions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = mathFinanceAnswers[question.id];

      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = mathFinanceQuestions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      total_score: correctAnswers,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      percentage
    };
  };

  // 提交测试
  const handleSubmit = async () => {
    if (answeredCount < mathFinanceQuestions.length) {
      toast({
        title: '请完成所有题目',
        description: `还有 ${mathFinanceQuestions.length - answeredCount} 道题未完成`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const scores = calculateScores();
      setMathFinanceScores(scores);

      // 更新数据库
      if (testId) {
        await testResultApi.updateTestResult(testId, {
          math_finance_scores: scores
        });
      }

      // 更新进度
      setProgress({
        ...progress,
        current_step: 2,
        completed_tests: [...progress.completed_tests, 'math_finance']
      });

      toast({
        title: '数学金融测试完成',
        description: '正在进入风险偏好测试',
      });

      navigate('/test/risk-preference');
    } catch (error) {
      console.error('Submit math finance test error:', error);
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
            <h1 className="text-3xl font-bold gradient-text mb-2">数学与金融能力测试</h1>
            <p className="text-muted-foreground">
              评估您对投资相关数学和金融知识的理解程度
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
                  {answeredCount} / {mathFinanceQuestions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {mathFinanceQuestions.map((question, index) => (
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
            disabled={answeredCount < mathFinanceQuestions.length}
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

export default MathFinanceTestPage;
