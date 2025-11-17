import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';
import { paymentApi, deepseekApi } from '@/db/api';
import { adminApi } from '@/db/adminApi';
import {
  matchInvestmentStyleV2,
  generatePersonalityAnalysis,
  generateMathFinanceAnalysis,
  generateRiskAnalysis,
  generateTradingCharacteristicsAnalysis,
  generateDetailedRecommendations
} from '@/utils/calculations';
import type { ReportData, DeepSeekAnalysis } from '@/types/types';
import type { MatchingResult } from '@/utils/weightedMatching';
import { Download, Home, Printer, TrendingUp, Brain, Calculator, Shield } from 'lucide-react';
import { testResultStorage } from '@/utils/localStorage';
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
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [isCheckingPaymentEnabled, setIsCheckingPaymentEnabled] = useState(true);

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
    checkPaymentEnabled();
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

  const checkPaymentEnabled = async () => {
    try {
      const enabled = await adminApi.getPaymentSystemStatus();
      setPaymentEnabled(enabled);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentEnabled(true);
    } finally {
      setIsCheckingPaymentEnabled(false);
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
      // 使用新的加权匹配算法
      const { bestMatch, allMatches } = matchInvestmentStyleV2(
        personalityScores,
        mathFinanceScores.percentage,
        riskPreferenceScores.risk_tolerance
      );

      // 保存匹配结果
      setMatchingResults(allMatches);

      // 生成分析文本
      const personalityAnalysis = generatePersonalityAnalysis(personalityScores);
      const tradingCharacteristicsAnalysis = generateTradingCharacteristicsAnalysis(tradingCharacteristics);
      const mathFinanceAnalysis = generateMathFinanceAnalysis(mathFinanceScores.percentage);
      const riskAnalysis = generateRiskAnalysis(
        riskPreferenceScores.risk_tolerance,
        riskPreferenceScores.investment_horizon
      );
      const recommendations = generateDetailedRecommendations(
        bestMatch.archetype.name,
        personalityScores,
        mathFinanceScores.percentage,
        riskPreferenceScores.risk_tolerance
      );

      const reportData: ReportData = {
        user_email: user.email,
        test_date: new Date().toLocaleDateString('zh-CN'),
        personality_analysis: personalityAnalysis,
        trading_characteristics_analysis: tradingCharacteristicsAnalysis,
        math_finance_analysis: mathFinanceAnalysis,
        risk_analysis: riskAnalysis,
        recommended_strategy: bestMatch.archetype.description,
        investment_style: bestMatch.archetype.name,
        detailed_recommendations: recommendations
      };

      setReportData(reportData);

      // 仅本地保存历史
      try {
        testResultStorage.saveTestResult({
          id: testId || `${Date.now()}`,
          user_id: user.id,
          personality_scores: personalityScores,
          math_finance_scores: { percentage: mathFinanceScores.percentage },
          risk_preference_scores: riskPreferenceScores,
          investment_style: bestMatch.archetype.name,
          euclidean_distance: bestMatch.final_score,
          completed_at: new Date().toISOString()
        } as any);
      } catch (e) {
        console.error('本地保存测试结果失败:', e);
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

          {/* Transparent Matching Report */}
          {matchingResults.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">匹配度透明分析</CardTitle>
                    <CardDescription>
                      基于加权距离算法的科学匹配评估
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Best Match Details */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-bold text-lg mb-3">🎯 最佳匹配：{matchingResults[0].archetype.name}</h4>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">匹配度得分</div>
                        <div className="text-2xl font-bold text-primary">{matchingResults[0].final_score.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">{matchingResults[0].match_level}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">推荐交易频率</div>
                        <div className="text-sm font-medium">{matchingResults[0].archetype.trading_frequency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">推荐持仓周期</div>
                        <div className="text-sm font-medium">{matchingResults[0].archetype.holding_period}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">推荐交易风格</div>
                      <div className="text-sm font-medium">{matchingResults[0].archetype.trading_style}</div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {matchingResults[0].explanation}
                    </div>
                  </div>

                  {/* Trait Scores Table */}
                  <div>
                    <h4 className="font-bold mb-3">📊 特征评分详情</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">特征</th>
                            <th className="text-center py-2 px-3">您的值</th>
                            <th className="text-center py-2 px-3">理想区间</th>
                            <th className="text-center py-2 px-3">得分</th>
                            <th className="text-center py-2 px-3">权重</th>
                            <th className="text-center py-2 px-3">加权得分</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchingResults[0].trait_scores.map((trait, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-3 font-medium">{trait.trait}</td>
                              <td className="text-center py-2 px-3">{trait.user_value}</td>
                              <td className="text-center py-2 px-3">
                                [{trait.ideal_range[0]}, {trait.ideal_range[1]}]
                              </td>
                              <td className="text-center py-2 px-3">
                                <span className={trait.score >= 80 ? 'text-green-600 font-medium' : trait.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                                  {trait.score.toFixed(0)}
                                </span>
                              </td>
                              <td className="text-center py-2 px-3">{trait.weight.toFixed(1)}x</td>
                              <td className="text-center py-2 px-3 font-medium">{trait.weighted_score.toFixed(1)}</td>
                            </tr>
                          ))}
                          <tr className="border-b">
                            <td className="py-2 px-3 font-medium">数学能力</td>
                            <td className="text-center py-2 px-3">{mathFinanceScores?.percentage}%</td>
                            <td className="text-center py-2 px-3">
                              [{matchingResults[0].archetype.math_range[0]}, {matchingResults[0].archetype.math_range[1]}]
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={matchingResults[0].math_score >= 80 ? 'text-green-600 font-medium' : matchingResults[0].math_score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                                {matchingResults[0].math_score.toFixed(0)}
                              </span>
                            </td>
                            <td className="text-center py-2 px-3">15%</td>
                            <td className="text-center py-2 px-3 font-medium">{(matchingResults[0].math_score * 0.15).toFixed(1)}</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium">风险偏好</td>
                            <td className="text-center py-2 px-3">{riskPreferenceScores?.risk_tolerance}</td>
                            <td className="text-center py-2 px-3">
                              [{matchingResults[0].archetype.risk_range[0]}, {matchingResults[0].archetype.risk_range[1]}]
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={matchingResults[0].risk_score >= 80 ? 'text-green-600 font-medium' : matchingResults[0].risk_score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                                {matchingResults[0].risk_score.toFixed(0)}
                              </span>
                            </td>
                            <td className="text-center py-2 px-3">15%</td>
                            <td className="text-center py-2 px-3 font-medium">{(matchingResults[0].risk_score * 0.15).toFixed(1)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* All Matches Ranking */}
                  <div>
                    <h4 className="font-bold mb-3">🏆 所有投资风格匹配度排名</h4>
                    <div className="space-y-2">
                      {matchingResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            index === 0
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-muted/30 border-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`text-lg font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{result.archetype.name}</div>
                                <div className="text-xs text-muted-foreground">{result.archetype.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                {result.final_score.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">{result.match_level}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Algorithm Explanation */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                    <h4 className="font-bold mb-2">📖 算法说明</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>加权距离算法：</strong>不同特征具有不同的重要性权重。神经质（2.5x）和尽责性（2.0x）权重最高，
                        因为它们对投资行为影响最大。
                      </p>
                      <p>
                        <strong>区间评分法：</strong>每个投资原型对每个特征都定义了理想区间。您的特征值在区间内得满分（100分），
                        偏离区间则按距离扣分（每偏离1分扣10分）。
                      </p>
                      <p>
                        <strong>惩罚机制：</strong>对于严重不匹配的情况（如保守型投资者反应极快），系统会应用惩罚系数，
                        大幅降低匹配度得分，确保推荐的合理性。
                      </p>
                      <p>
                        <strong>综合评分：</strong>最终得分 = 人格特征得分（70%）+ 数学能力得分（15%）+ 风险偏好得分（15%）- 约束惩罚。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
          {deepseekEnabled && !isCheckingPurchase && !isCheckingPaymentEnabled && (
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
                  paymentEnabled={paymentEnabled}
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
