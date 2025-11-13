import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';
import { testResultApi, reportApi, paymentApi, deepseekApi } from '@/db/api';
import { adminApi } from '@/db/adminApi';
import {
  matchInvestmentStyle,
  generatePersonalityAnalysis,
  generateMathFinanceAnalysis,
  generateRiskAnalysis,
  generateTradingCharacteristicsAnalysis,
  generateDetailedRecommendations
} from '@/utils/calculations';
import type { ReportData, DeepSeekAnalysis } from '@/types/types';
import { Download, Home, Printer, TrendingUp, Brain, Calculator, Shield } from 'lucide-react';
import PurchaseAnalysisCard from '@/components/analysis/PurchaseAnalysisCard';
import DeepSeekAnalysisCard from '@/components/analysis/DeepSeekAnalysisCard';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { testId, personalityScores, tradingCharacteristics, mathFinanceScores, riskPreferenceScores, resetTest } = useTest();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [deepseekAnalysis, setDeepseekAnalysis] = useState<DeepSeekAnalysis | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  const [deepseekEnabled, setDeepseekEnabled] = useState(false);

  useEffect(() => {
    if (!testId || !personalityScores || !tradingCharacteristics || !mathFinanceScores || !riskPreferenceScores) {
      toast({
        title: '数据不完整',
        description: '请完成所有测试',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    generateReport();
    checkDeepSeekStatus();
    checkPurchaseStatus();
  }, []);

  const checkDeepSeekStatus = async () => {
    try {
      const enabled = await adminApi.getDeepSeekEnabled();
      setDeepseekEnabled(enabled);
    } catch (error) {
      console.error('Error checking DeepSeek status:', error);
      setDeepseekEnabled(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!testId) return;

    setIsCheckingPurchase(true);
    try {
      // 检查是否已购买
      const order = await paymentApi.getCompletedOrderByTestResult(testId);
      if (order) {
        setHasPurchased(true);
        
        // 检查是否已有分析
        const analysis = await deepseekApi.getAnalysisByTestResult(testId);
        if (analysis) {
          setDeepseekAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setIsCheckingPurchase(false);
    }
  };

  const generateReport = async () => {
    if (!personalityScores || !tradingCharacteristics || !mathFinanceScores || !riskPreferenceScores || !user) {
      return;
    }

    setIsGenerating(true);

    try {
      // 匹配投资风格
      const { style, distance } = matchInvestmentStyle(
        personalityScores,
        mathFinanceScores.percentage,
        riskPreferenceScores.risk_tolerance
      );

      // 生成分析文本
      const personalityAnalysis = generatePersonalityAnalysis(personalityScores);
      const tradingCharacteristicsAnalysis = generateTradingCharacteristicsAnalysis(tradingCharacteristics);
      const mathFinanceAnalysis = generateMathFinanceAnalysis(mathFinanceScores.percentage);
      const riskAnalysis = generateRiskAnalysis(
        riskPreferenceScores.risk_tolerance,
        riskPreferenceScores.investment_horizon
      );
      const recommendations = generateDetailedRecommendations(
        style.name,
        personalityScores,
        mathFinanceScores.percentage,
        riskPreferenceScores.risk_tolerance
      );

      const report: ReportData = {
        user_email: user.email,
        test_date: new Date().toLocaleDateString('zh-CN'),
        personality_analysis: personalityAnalysis,
        trading_characteristics_analysis: tradingCharacteristicsAnalysis,
        math_finance_analysis: mathFinanceAnalysis,
        risk_analysis: riskAnalysis,
        recommended_strategy: style.description,
        investment_style: style.name,
        detailed_recommendations: recommendations
      };

      setReportData(report);

      // 更新数据库
      if (testId) {
        await testResultApi.updateTestResult(testId, {
          investment_style: style.name,
          euclidean_distance: distance
        });

        // 保存报告
        await reportApi.createReport(user.id, testId, report);
      }

      toast({
        title: '报告生成成功',
        description: '您的投资策略评估报告已准备就绪',
      });
    } catch (error) {
      console.error('Generate report error:', error);
      toast({
        title: '生成失败',
        description: '无法生成报告，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast({
      title: '下载提示',
      description: '请使用浏览器的打印功能，选择"另存为PDF"来保存报告',
    });
    window.print();
  };

  const handleBackHome = () => {
    resetTest();
    navigate('/');
  };

  if (isGenerating || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">正在生成您的投资策略报告...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Hide on print */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">投资策略评估报告</h1>
            <p className="text-muted-foreground">基于您的测试结果生成的个性化投资建议</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              打印
            </Button>
            <Button onClick={handleDownloadPDF} className="btn-glow">
              <Download className="mr-2 h-4 w-4" />
              下载PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6 print:space-y-4">
          {/* Summary Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">推荐投资策略</CardTitle>
                  <CardDescription>
                    测试日期：{reportData.test_date} | 用户：{reportData.user_email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">{reportData.investment_style}</h3>
                  <p className="text-muted-foreground">{reportData.recommended_strategy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>人格特质分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{reportData.personality_analysis}</p>
              {personalityScores && (
                <div className="mt-4 grid grid-cols-2 xl:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{personalityScores.openness}</div>
                    <div className="text-xs text-muted-foreground">开放性</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{personalityScores.conscientiousness}</div>
                    <div className="text-xs text-muted-foreground">尽责性</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{personalityScores.extraversion}</div>
                    <div className="text-xs text-muted-foreground">外向性</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{personalityScores.agreeableness}</div>
                    <div className="text-xs text-muted-foreground">宜人性</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{personalityScores.neuroticism}</div>
                    <div className="text-xs text-muted-foreground">神经质</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trading Characteristics Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>交易特征分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{reportData.trading_characteristics_analysis}</p>
              {tradingCharacteristics && (
                <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">交易频率：</span>
                    <span className="text-primary font-medium">{tradingCharacteristics.trading_frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">偏好标的：</span>
                    <span className="text-primary font-medium">{tradingCharacteristics.preferred_instruments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">分析方法：</span>
                    <span className="text-primary font-medium">{tradingCharacteristics.analysis_method}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">投资理念：</span>
                    <span className="text-primary font-medium">{tradingCharacteristics.investment_philosophy}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Math Finance Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>数学金融能力分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{reportData.math_finance_analysis}</p>
              {mathFinanceScores && (
                <div className="mt-4 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{mathFinanceScores.percentage}%</div>
                    <div className="text-xs text-muted-foreground">正确率</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    答对 {mathFinanceScores.correct_answers} / {mathFinanceScores.total_questions} 题
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>风险偏好分析</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{reportData.risk_analysis}</p>
              {riskPreferenceScores && (
                <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{riskPreferenceScores.risk_tolerance}/10</div>
                    <div className="text-xs text-muted-foreground">风险承受能力</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{riskPreferenceScores.loss_aversion}/10</div>
                    <div className="text-xs text-muted-foreground">损失厌恶程度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-primary">{riskPreferenceScores.investment_horizon}</div>
                    <div className="text-xs text-muted-foreground">投资期限</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>详细投资建议</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.detailed_recommendations.map((recommendation, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* DeepSeek AI Analysis Section */}
          {deepseekEnabled && !isCheckingPurchase && (
            <div className="print:hidden">
              {deepseekAnalysis ? (
                <DeepSeekAnalysisCard analysis={deepseekAnalysis} />
              ) : hasPurchased ? (
                <Card className="border-primary/30">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      您已购买深度分析，正在生成中...
                    </p>
                  </CardContent>
                </Card>
              ) : testId ? (
                <PurchaseAnalysisCard 
                  testResultId={testId} 
                  onPurchaseComplete={checkPurchaseStatus}
                />
              ) : null}
            </div>
          )}

          {/* Disclaimer */}
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ 免责声明：本报告仅供参考，不构成投资建议。投资有风险，决策需谨慎。
                请根据自身实际情况和风险承受能力做出投资决策。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions - Hide on print */}
        <div className="flex justify-center gap-4 print:hidden">
          <Button variant="outline" onClick={handleBackHome}>
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
