import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTest } from '@/contexts/TestContext';
import { testResultApi } from '@/db/api';
import { personalityQuestions, likertOptions, reverseScoreQuestions } from '@/data/questions';
import type { PersonalityScores } from '@/types/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PersonalityTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testId, setPersonalityScores, progress, setProgress } = useTest();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;
  const totalPages = Math.ceil(personalityQuestions.length / questionsPerPage);

  // 检查是否有测试ID
  React.useEffect(() => {
    if (!testId) {
      toast({
        title: '请先开始测试',
        description: '请从首页开始新的测试',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [testId, navigate, toast]);

  // 获取当前页的问题
  const currentQuestions = personalityQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // 计算进度
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / personalityQuestions.length) * 100;

  // 处理答案选择
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  // 计算人格分数
  const calculateScores = (): PersonalityScores => {
    const scores: PersonalityScores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const counts: Record<keyof PersonalityScores, number> = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    personalityQuestions.forEach((question) => {
      const answer = answers[question.id];
      if (answer && question.trait) {
        // 反向计分
        const score = reverseScoreQuestions.includes(question.id) ? 6 - answer : answer;
        scores[question.trait] += score;
        counts[question.trait]++;
      }
    });

    // 计算平均分并转换为1-10的量表
    Object.keys(scores).forEach((trait) => {
      const key = trait as keyof PersonalityScores;
      if (counts[key] > 0) {
        scores[key] = Math.round((scores[key] / counts[key]) * 2); // 5分制转10分制
      }
    });

    return scores;
  };

  // 提交测试
  const handleSubmit = async () => {
    if (answeredCount < personalityQuestions.length) {
      toast({
        title: '请完成所有题目',
        description: `还有 ${personalityQuestions.length - answeredCount} 道题未完成`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const scores = calculateScores();
      setPersonalityScores(scores);

      // 更新数据库
      if (testId) {
        await testResultApi.updateTestResult(testId, {
          personality_scores: scores
        });
      }

      // 更新进度
      setProgress({
        ...progress,
        current_step: 1,
        completed_tests: [...progress.completed_tests, 'personality']
      });

      toast({
        title: '人格测试完成',
        description: '正在进入数学金融能力测试',
      });

      navigate('/test/math-finance');
    } catch (error) {
      console.error('Submit personality test error:', error);
      toast({
        title: '提交失败',
        description: '无法保存测试结果，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 下一页
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 上一页
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <h1 className="text-3xl font-bold gradient-text mb-2">人格特质测试</h1>
            <p className="text-muted-foreground">
              基于Big Five人格模型，请根据您的真实感受选择最符合的选项
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
                  {answeredCount} / {personalityQuestions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {currentQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentPage * questionsPerPage + index + 1}. {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                >
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
                    {likertOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className="cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            上一页
          </Button>

          <span className="text-sm text-muted-foreground">
            第 {currentPage + 1} / {totalPages} 页
          </span>

          {currentPage < totalPages - 1 ? (
            <Button onClick={handleNextPage}>
              下一页
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < personalityQuestions.length}
              className="btn-glow"
            >
              完成并继续
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestPage;
