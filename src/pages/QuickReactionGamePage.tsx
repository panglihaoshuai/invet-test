import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Zap, TrendingUp, TrendingDown, Pause, ChevronLeft, RotateCcw, AlertTriangle } from 'lucide-react';

const QuickReactionGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'cooldown' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [signal, setSignal] = useState<'buy' | 'sell' | 'hold'>('hold');
  const [correctAction, setCorrectAction] = useState<'buy' | 'sell' | 'hold'>('hold');
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [showRevengeTrade, setShowRevengeTrade] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [cooldownCount, setCooldownCount] = useState(0);
  const [roundHistory, setRoundHistory] = useState<{
    round: number;
    signal: string;
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
    const signals: ('buy' | 'sell' | 'hold')[] = ['buy', 'sell', 'hold'];
    const newSignal = signals[Math.floor(Math.random() * signals.length)];
    const newCorrectAction = newSignal; // 简化：信号即为正确动作
    
    setSignal(newSignal);
    setCorrectAction(newCorrectAction);
    setTimeLeft(10);
    setShowRevengeTrade(false);
    startTimeRef.current = Date.now();
  };

  const handleAction = (action: 'buy' | 'sell' | 'hold') => {
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
        description: `-5 金币`,
        variant: 'destructive'
      });
    }
    
    setResponseTimes(prev => [...prev, responseTime]);
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      signal: signal,
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
    setCoins(prev => prev - 5);
    setConsecutiveLosses(prev => prev + 1);
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      signal: signal,
      action: 'timeout',
      correct: false,
      responseTime: 10,
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
            <CardDescription>测试您的决策速度与情绪控制能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>共 <strong className="text-primary">10 轮</strong>，每轮 <strong className="text-primary">10 秒</strong>内响应信号</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>正确决策 <strong className="text-green-500">+10 金币</strong>，错误或超时 <strong className="text-red-500">-5 金币</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>连续亏损后出现<strong className="text-destructive">"复仇交易"</strong>诱导（高杠杆选项）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>可暂停"冷静期"（5秒）避免冲动决策</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估情绪控制和速度偏好。快决策者适合超短线；慢而稳者偏长线。
                  连续亏损后行为反映情绪失控（tilt）。
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

        {/* Signal */}
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              <Zap className="inline h-8 w-8 mr-2 text-yellow-500" />
              信号
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 bg-primary/10 rounded-lg">
              <p className="text-5xl font-bold text-primary mb-4">
                {signal === 'buy' && '📈 买入'}
                {signal === 'sell' && '📉 卖出'}
                {signal === 'hold' && '⏸️ 持有'}
              </p>
            </div>
          </CardContent>
        </Card>

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
                  持有
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
