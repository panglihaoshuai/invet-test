import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Zap, TrendingUp, TrendingDown, Pause, ChevronLeft, RotateCcw, AlertTriangle, Activity } from 'lucide-react';

// 技术指标类型
interface TechnicalIndicators {
  rsi: number;           // 0-100
  macd: number;          // -10 to 10
  maPosition: 'above' | 'below' | 'at'; // 价格相对均线位置
  volume: 'high' | 'normal' | 'low';
  bollingerBand: 'upper' | 'middle' | 'lower';
  trend: 'up' | 'down' | 'sideways';
}

// 生成随机技术指标
const generateRandomIndicators = (): TechnicalIndicators => {
  // 10%概率生成一致信号，90%概率生成混合信号
  const aligned = Math.random() < 0.1;
  
  if (aligned) {
    // 一致信号：所有指标指向同一方向
    const direction = Math.random() < 0.5 ? 'bullish' : 'bearish';
    
    if (direction === 'bullish') {
      return {
        rsi: 20 + Math.random() * 20,  // 20-40 (超卖)
        macd: 2 + Math.random() * 5,   // 2-7 (正值)
        maPosition: 'above',
        volume: Math.random() < 0.7 ? 'high' : 'normal',
        bollingerBand: 'lower',
        trend: 'up'
      };
    } else {
      return {
        rsi: 70 + Math.random() * 20,  // 70-90 (超买)
        macd: -7 + Math.random() * 5,  // -7 to -2 (负值)
        maPosition: 'below',
        volume: Math.random() < 0.7 ? 'high' : 'normal',
        bollingerBand: 'upper',
        trend: 'down'
      };
    }
  } else {
    // 混合信号：指标方向不一致
    return {
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 20,
      maPosition: ['above', 'below', 'at'][Math.floor(Math.random() * 3)] as any,
      volume: ['high', 'normal', 'low'][Math.floor(Math.random() * 3)] as any,
      bollingerBand: ['upper', 'middle', 'lower'][Math.floor(Math.random() * 3)] as any,
      trend: ['up', 'down', 'sideways'][Math.floor(Math.random() * 3)] as any
    };
  }
};

// 计算指标得分
const calculateIndicatorScore = (indicators: TechnicalIndicators): number => {
  let score = 0;
  
  // RSI: <30 超卖(+1), 30-70 中性(0), >70 超买(-1)
  if (indicators.rsi < 30) score += 1;
  else if (indicators.rsi > 70) score -= 1;
  
  // MACD: 正值看涨(+1), 负值看跌(-1)
  if (indicators.macd > 2) score += 1;
  else if (indicators.macd < -2) score -= 1;
  
  // MA位置: 价格在均线上方(+1), 下方(-1)
  if (indicators.maPosition === 'above') score += 1;
  else if (indicators.maPosition === 'below') score -= 1;
  
  // 成交量: 高成交量配合趋势(+1/-1)
  if (indicators.volume === 'high') {
    if (indicators.trend === 'up') score += 1;
    else if (indicators.trend === 'down') score -= 1;
  }
  
  // 布林带: 价格在下轨(+1), 上轨(-1)
  if (indicators.bollingerBand === 'lower') score += 1;
  else if (indicators.bollingerBand === 'upper') score -= 1;
  
  // 趋势: 上升(+1), 下降(-1)
  if (indicators.trend === 'up') score += 1;
  else if (indicators.trend === 'down') score -= 1;
  
  return score;
};

// 根据得分确定正确动作
const getCorrectAction = (score: number): 'buy' | 'sell' | 'hold' => {
  if (score >= 3) return 'buy';      // 强烈看涨
  if (score <= -3) return 'sell';    // 强烈看跌
  return 'hold';                      // 信号不明确，等待
};

const QuickReactionGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'cooldown' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 增加到15秒，因为需要分析多个指标
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [correctAction, setCorrectAction] = useState<'buy' | 'sell' | 'hold'>('hold');
  const [indicatorScore, setIndicatorScore] = useState(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [showRevengeTrade, setShowRevengeTrade] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [cooldownCount, setCooldownCount] = useState(0);
  const [roundHistory, setRoundHistory] = useState<{
    round: number;
    indicators: TechnicalIndicators;
    score: number;
    action: string;
    correct: boolean;
    responseTime: number;
    coins: number;
  }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, gameState]);

  const startNewGame = () => {
    setCoins(0);
    setCurrentRound(1);
    setConsecutiveLosses(0);
    setResponseTimes([]);
    setCooldownCount(0);
    setRoundHistory([]);
    setGameState('playing');
    setShowInstructions(false);
    startNewRound();
  };

  const startNewRound = () => {
    const newIndicators = generateRandomIndicators();
    const score = calculateIndicatorScore(newIndicators);
    const action = getCorrectAction(score);
    
    setIndicators(newIndicators);
    setIndicatorScore(score);
    setCorrectAction(action);
    setTimeLeft(15);
    setShowRevengeTrade(false);
    startTimeRef.current = Date.now();
  };

  const handleAction = (action: 'buy' | 'sell' | 'hold') => {
    if (!indicators) return;
    
    const responseTime = (Date.now() - startTimeRef.current) / 1000;
    const correct = action === correctAction;
    
    let coinsChange = 0;
    if (correct) {
      coinsChange = 10;
      setCoins(prev => prev + 10);
      setConsecutiveLosses(0);
      
      toast({
        title: '✅ 正确！',
        description: `+10 金币（响应时间: ${responseTime.toFixed(2)}秒）`,
      });
    } else {
      coinsChange = -5;
      setCoins(prev => prev - 5);
      setConsecutiveLosses(prev => prev + 1);
      
      toast({
        title: '❌ 错误',
        description: `-5 金币 | 正确动作: ${correctAction === 'buy' ? '买入' : correctAction === 'sell' ? '卖出' : '等待'}`,
        variant: 'destructive'
      });
    }
    
    setResponseTimes(prev => [...prev, responseTime]);
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      indicators,
      score: indicatorScore,
      action,
      correct,
      responseTime,
      coins: coinsChange
    }]);
    
    // 检查是否触发复仇交易
    if (consecutiveLosses >= 2 && !correct) {
      setShowRevengeTrade(true);
      toast({
        title: '⚠️ 情绪波动',
        description: '连续亏损，是否使用高杠杆复仇？',
      });
      // 不立即进入下一轮，等待用户选择
      return;
    }
    
    // 下一轮
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const handleTimeout = () => {
    if (!indicators) return;
    
    setCoins(prev => prev - 5);
    setConsecutiveLosses(prev => prev + 1);
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      indicators,
      score: indicatorScore,
      action: 'timeout',
      correct: false,
      responseTime: 15,
      coins: -5
    }]);
    
    toast({
      title: '⏰ 超时',
      description: `-5 金币`,
      variant: 'destructive'
    });
    
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const activateCooldown = () => {
    setCooldownActive(true);
    setCooldownCount(prev => prev + 1);
    setGameState('cooldown');
    
    toast({
      title: '😌 冷静期',
      description: '暂停5秒，调整心态',
    });
    
    setTimeout(() => {
      setCooldownActive(false);
      setGameState('playing');
      setConsecutiveLosses(0);
      startNewRound();
    }, 5000);
  };

  const revengeTradeHighLeverage = () => {
    // 高杠杆复仇交易：双倍收益或双倍损失
    const success = Math.random() > 0.5;
    
    if (success) {
      setCoins(prev => prev + 20);
      toast({
        title: '🎉 复仇成功',
        description: `+20 金币（高杠杆）`,
      });
    } else {
      setCoins(prev => prev - 10);
      toast({
        title: '💥 复仇失败',
        description: `-10 金币（高杠杆）`,
        variant: 'destructive'
      });
    }
    
    setShowRevengeTrade(false);
    setConsecutiveLosses(0);
    
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const skipRevengeTrade = () => {
    setShowRevengeTrade(false);
    
    toast({
      title: '理性决策',
      description: '放弃复仇交易，继续正常游戏',
    });
    
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const finishGame = () => {
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;
    const correctCount = roundHistory.filter(r => r.correct).length;
    const accuracy = (correctCount / totalRounds) * 100;
    
    // 计算决策速度偏好 (0-100)
    const speedScore = Math.max(0, 100 - (avgResponseTime * 20));
    
    // 计算情绪控制 (0-100)
    const emotionControl = (cooldownCount / Math.max(1, consecutiveLosses)) * 100;
    
    // 计算冲动决策比例
    const impulsiveDecisions = roundHistory.filter(r => r.responseTime < 3).length;
    const impulsiveRate = (impulsiveDecisions / totalRounds) * 100;
    
    const gameResult = {
      coins,
      totalRounds,
      correctCount,
      accuracy,
      avgResponseTime,
      cooldownCount,
      speedScore,
      emotionControl,
      impulsiveRate,
      roundHistory,
      timestamp: Date.now()
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('quick-reaction')) {
      completedGames.push('quick-reaction');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('quickReactionResult', JSON.stringify(gameResult));
    
    setGameState('results');
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">⚡ 快速反应游戏</CardTitle>
            <CardDescription>测试您的决策速度、分析能力与情绪控制</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>共 <strong className="text-primary">10 轮</strong>，每轮 <strong className="text-primary">15 秒</strong>内分析技术指标并做出决策</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>系统显示 <strong className="text-primary">6 个技术指标</strong>（RSI、MACD、均线、成交量、布林带、趋势），需要综合判断</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span><strong className="text-yellow-500">90%的情况</strong>指标方向不一致，需要权衡判断；<strong className="text-yellow-500">仅10%</strong>会出现一致信号</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>正确决策 <strong className="text-green-500">+10 金币</strong>，错误或超时 <strong className="text-red-500">-5 金币</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>连续亏损后出现<strong className="text-destructive">"复仇交易"</strong>诱导（高杠杆选项）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">6.</span>
                  <span>可暂停"冷静期"（5秒）避免冲动决策</span>
                </li>
              </ul>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 text-sm">📊 指标解读提示：</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• <strong>RSI &lt; 30</strong>：超卖（看涨） | <strong>RSI &gt; 70</strong>：超买（看跌）</li>
                  <li>• <strong>MACD 正值</strong>：看涨 | <strong>MACD 负值</strong>：看跌</li>
                  <li>• <strong>价格在均线上方</strong>：看涨 | <strong>下方</strong>：看跌</li>
                  <li>• <strong>高成交量配合趋势</strong>：增强信号强度</li>
                  <li>• <strong>价格在布林带下轨</strong>：看涨 | <strong>上轨</strong>：看跌</li>
                  <li>• <strong>上升趋势</strong>：看涨 | <strong>下降趋势</strong>：看跌</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估分析能力、决策速度和情绪控制。真实交易中指标经常冲突，
                  需要综合判断。信号不明确时应选择"等待"，体现纪律性。
                </p>
              </div>
            </div>

            <Button 
              onClick={startNewGame} 
              className="w-full btn-glow"
              size="lg"
            >
              开始游戏
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'cooldown') {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">😌 冷静期</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Pause className="h-24 w-24 mx-auto text-primary mb-4" />
              <p className="text-lg text-muted-foreground">
                深呼吸，调整心态...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'results') {
    const result = JSON.parse(localStorage.getItem('quickReactionResult') || '{}');
    
    return (
      <div className="min-h-screen p-4 xl:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/games')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回游戏中心
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">游戏结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总金币</p>
                  <p className={`text-2xl font-bold ${result.coins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.coins >= 0 ? '+' : ''}{result.coins}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">准确率</p>
                  <p className="text-2xl font-bold">{result.accuracy?.toFixed(0)}%</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">平均响应</p>
                  <p className="text-2xl font-bold">{result.avgResponseTime?.toFixed(2)}秒</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">决策速度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={result.speedScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.speedScore?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.speedScore > 70 && '极快决策 - 适合超短线交易'}
                        {result.speedScore > 40 && result.speedScore <= 70 && '中等速度 - 适合日内交易'}
                        {result.speedScore <= 40 && '较慢决策 - 适合长线投资'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">情绪控制</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">冷静期使用</span>
                        <span className="font-bold">{result.cooldownCount} 次</span>
                      </div>
                      <Progress value={Math.min(100, result.emotionControl)} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {Math.min(100, result.emotionControl)?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.cooldownCount > 2 && '良好情绪控制'}
                        {result.cooldownCount <= 2 && result.cooldownCount > 0 && '一般情绪控制'}
                        {result.cooldownCount === 0 && '需要提升情绪管理'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">决策记录</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.roundHistory?.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">第 {record.round} 轮</span>
                      <span className="font-medium">
                        {record.action === 'timeout' ? '超时' : record.action}
                        {record.correct && ' ✓'}
                      </span>
                      <span className="text-xs text-muted-foreground">{record.responseTime?.toFixed(2)}s</span>
                      <span className={`font-bold ${record.coins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {record.coins >= 0 ? '+' : ''}{record.coins}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={startNewGame} className="flex-1" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  再玩一次
                </Button>
                <Button onClick={() => navigate('/games')} className="flex-1 btn-glow">
                  返回游戏中心
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/games')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回游戏中心
        </Button>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>游戏进度</span>
              <span className="text-sm text-muted-foreground">
                第 {currentRound} / {totalRounds} 轮
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(currentRound / totalRounds) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Timer and Coins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={timeLeft <= 3 ? 'border-red-500 border-2' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">剩余时间</p>
                <p className={`text-5xl font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-primary'}`}>
                  {timeLeft}秒
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">当前金币</p>
                <p className={`text-5xl font-bold ${coins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coins >= 0 ? '+' : ''}{coins}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Indicators */}
        {indicators && (
          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                技术指标分析
              </CardTitle>
              <CardDescription className="text-center">
                综合分析以下指标，做出交易决策
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RSI */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">RSI (相对强弱指标)</span>
                    <span className={`text-lg font-bold ${
                      indicators.rsi < 30 ? 'text-green-500' : 
                      indicators.rsi > 70 ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <Progress value={indicators.rsi} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {indicators.rsi < 30 && '超卖区域 - 可能反弹'}
                    {indicators.rsi >= 30 && indicators.rsi <= 70 && '中性区域'}
                    {indicators.rsi > 70 && '超买区域 - 可能回调'}
                  </p>
                </div>

                {/* MACD */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">MACD (趋势指标)</span>
                    <span className={`text-lg font-bold ${
                      indicators.macd > 2 ? 'text-green-500' : 
                      indicators.macd < -2 ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.macd.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${indicators.macd > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(indicators.macd) * 10)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {indicators.macd > 2 && '正值 - 上涨动能'}
                    {indicators.macd >= -2 && indicators.macd <= 2 && '接近零轴 - 动能弱'}
                    {indicators.macd < -2 && '负值 - 下跌动能'}
                  </p>
                </div>

                {/* MA Position */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">均线位置</span>
                    <span className={`text-lg font-bold ${
                      indicators.maPosition === 'above' ? 'text-green-500' : 
                      indicators.maPosition === 'below' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.maPosition === 'above' && '上方 ↑'}
                      {indicators.maPosition === 'below' && '下方 ↓'}
                      {indicators.maPosition === 'at' && '接近 →'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicators.maPosition === 'above' && '价格在均线上方 - 多头'}
                    {indicators.maPosition === 'below' && '价格在均线下方 - 空头'}
                    {indicators.maPosition === 'at' && '价格接近均线 - 观望'}
                  </p>
                </div>

                {/* Volume */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">成交量</span>
                    <span className={`text-lg font-bold ${
                      indicators.volume === 'high' ? 'text-yellow-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.volume === 'high' && '放量 📊'}
                      {indicators.volume === 'normal' && '正常 📊'}
                      {indicators.volume === 'low' && '缩量 📊'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicators.volume === 'high' && '成交活跃 - 信号增强'}
                    {indicators.volume === 'normal' && '成交正常'}
                    {indicators.volume === 'low' && '成交清淡 - 观望为主'}
                  </p>
                </div>

                {/* Bollinger Band */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">布林带位置</span>
                    <span className={`text-lg font-bold ${
                      indicators.bollingerBand === 'lower' ? 'text-green-500' : 
                      indicators.bollingerBand === 'upper' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.bollingerBand === 'upper' && '上轨'}
                      {indicators.bollingerBand === 'middle' && '中轨'}
                      {indicators.bollingerBand === 'lower' && '下轨'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicators.bollingerBand === 'lower' && '触及下轨 - 可能反弹'}
                    {indicators.bollingerBand === 'middle' && '中轨附近 - 中性'}
                    {indicators.bollingerBand === 'upper' && '触及上轨 - 可能回调'}
                  </p>
                </div>

                {/* Trend */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">趋势方向</span>
                    <span className={`text-lg font-bold ${
                      indicators.trend === 'up' ? 'text-green-500' : 
                      indicators.trend === 'down' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {indicators.trend === 'up' && '上升 📈'}
                      {indicators.trend === 'down' && '下降 📉'}
                      {indicators.trend === 'sideways' && '横盘 ↔️'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicators.trend === 'up' && '上升趋势 - 看涨'}
                    {indicators.trend === 'down' && '下降趋势 - 看跌'}
                    {indicators.trend === 'sideways' && '震荡整理 - 观望'}
                  </p>
                </div>
              </div>

              {/* Overall Signal Hint */}
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  💡 <strong>提示：</strong>综合分析所有指标，多数看涨时买入，多数看跌时卖出，信号不明确时等待
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {!showRevengeTrade && (
          <Card>
            <CardHeader>
              <CardTitle>快速决策</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleAction('buy')}
                  size="lg"
                  className="btn-glow h-20 text-lg"
                >
                  <TrendingUp className="mr-2 h-6 w-6" />
                  买入
                </Button>
                <Button 
                  onClick={() => handleAction('sell')}
                  size="lg"
                  variant="outline"
                  className="h-20 text-lg"
                >
                  <TrendingDown className="mr-2 h-6 w-6" />
                  卖出
                </Button>
                <Button 
                  onClick={() => handleAction('hold')}
                  size="lg"
                  variant="secondary"
                  className="h-20 text-lg"
                >
                  <Pause className="mr-2 h-6 w-6" />
                  等待
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooldown Option */}
        {consecutiveLosses >= 2 && !cooldownActive && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-semibold">连续亏损</p>
                    <p className="text-sm text-muted-foreground">建议使用冷静期调整心态</p>
                  </div>
                </div>
                <Button onClick={activateCooldown} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  冷静期
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenge Trade */}
        {showRevengeTrade && (
          <Card className="border-red-500 border-2 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <p className="text-2xl font-semibold text-red-500 mb-2">💥 复仇交易机会</p>
                  <p className="text-lg mb-2">连续亏损，情绪波动</p>
                  <p className="text-sm text-muted-foreground">使用高杠杆：50%概率 +20金币，50%概率 -10金币</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={skipRevengeTrade}
                    variant="outline"
                    size="lg"
                  >
                    理性放弃
                  </Button>
                  <Button 
                    onClick={revengeTradeHighLeverage}
                    variant="destructive"
                    size="lg"
                    className="btn-glow"
                  >
                    使用高杠杆
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuickReactionGamePage;
