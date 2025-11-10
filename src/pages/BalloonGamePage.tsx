import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTest } from '@/contexts/TestContext';
import { Coins, Bomb, TrendingUp, ChevronRight } from 'lucide-react';

const BalloonGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testId, setGameResults, progress } = useTest();
  
  const [currentCoins, setCurrentCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [popsCount, setPopsCount] = useState(0);
  const [explosionThreshold, setExplosionThreshold] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameHistory, setGameHistory] = useState<{
    round: number;
    pops: number;
    coins: number;
    exploded: boolean;
  }[]>([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // 检查是否完成了前面的测试
  useEffect(() => {
    if (!testId || !progress.completed_tests.includes('risk_preference')) {
      toast({
        title: '请先完成前面的测试',
        description: '需要完成风险偏好测试后才能进行游戏测试',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [testId, progress, navigate, toast]);

  const startNewRound = () => {
    // 随机设置爆炸阈值（5-15次之间）
    const threshold = Math.floor(Math.random() * 11) + 5;
    setExplosionThreshold(threshold);
    setCurrentCoins(0);
    setPopsCount(0);
    setGameActive(true);
    setIsExploding(false);
    setRoundNumber(prev => prev + 1);
  };

  const popBalloon = () => {
    if (!gameActive || isExploding) return;

    const newPopsCount = popsCount + 1;
    setPopsCount(newPopsCount);

    // 检查是否爆炸
    if (newPopsCount >= explosionThreshold) {
      handleExplosion();
    } else {
      const newCoins = currentCoins + 10;
      setCurrentCoins(newCoins);
      
      toast({
        title: '💰 +10 金币',
        description: `当前金币: ${newCoins}`,
      });
    }
  };

  const handleExplosion = () => {
    setIsExploding(true);
    setGameActive(false);
    
    // 记录本轮游戏
    setGameHistory(prev => [...prev, {
      round: roundNumber,
      pops: popsCount + 1,
      coins: 0,
      exploded: true
    }]);

    toast({
      title: '💥 气球爆炸了！',
      description: '本轮金币清零',
      variant: 'destructive'
    });

    // 延迟后可以开始新一轮
    setTimeout(() => {
      setIsExploding(false);
    }, 1500);
  };

  const cashOut = () => {
    if (!gameActive || currentCoins === 0) return;

    setGameActive(false);
    const newTotal = totalCoins + currentCoins;
    setTotalCoins(newTotal);

    // 记录本轮游戏
    setGameHistory(prev => [...prev, {
      round: roundNumber,
      pops: popsCount,
      coins: currentCoins,
      exploded: false
    }]);

    toast({
      title: '✅ 成功兑现！',
      description: `获得 ${currentCoins} 金币，总计: ${newTotal}`,
    });
  };

  const finishGame = () => {
    if (gameHistory.length < 3) {
      toast({
        title: '请至少完成3轮游戏',
        description: '需要更多数据来评估您的风险偏好',
        variant: 'destructive'
      });
      return;
    }

    // 计算风险偏好指标
    const totalRounds = gameHistory.length;
    const explosions = gameHistory.filter(g => g.exploded).length;
    const cashouts = gameHistory.filter(g => !g.exploded).length;
    const avgPopsBeforeCashout = cashouts > 0
      ? gameHistory.filter(g => !g.exploded).reduce((sum, g) => sum + g.pops, 0) / cashouts
      : 0;
    const maxPops = Math.max(...gameHistory.map(g => g.pops));
    
    // 风险评分 (1-10)
    // 基于: 平均扎气球次数、爆炸率、最大冒险次数
    const riskScore = Math.min(10, Math.round(
      (avgPopsBeforeCashout * 0.5) + 
      (explosions / totalRounds * 5) + 
      (maxPops * 0.3)
    ));

    const gameResults = {
      total_rounds: totalRounds,
      explosions,
      cashouts,
      total_coins: totalCoins,
      avg_pops_before_cashout: avgPopsBeforeCashout,
      max_pops: maxPops,
      risk_score: riskScore
    };

    setGameResults(gameResults);

    toast({
      title: '游戏测试完成',
      description: `风险评分: ${riskScore}/10`,
    });

    // 导航到下一个测试或结果页面
    navigate('/result');
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">🎈 气球游戏 - 风险偏好测试</CardTitle>
            <CardDescription>通过游戏测试您的风险承受能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>每扎破一个气球获得 <strong className="text-primary">10 金币</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>扎得越多，气球爆炸的风险越高（爆炸临界点随机在 5-15 次之间）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>如果气球爆炸，<strong className="text-destructive">本轮金币清零</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>您可以随时选择"兑现"来保存当前金币</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>需要完成 <strong className="text-primary">至少 3 轮</strong>游戏</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>通过您在风险与收益之间的决策，评估您的风险偏好和决策风格。
                  这将帮助我们更准确地为您推荐投资策略。
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setShowInstructions(false)} 
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

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总金币</p>
                  <p className="text-2xl font-bold text-primary">{totalCoins}</p>
                </div>
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已完成轮数</p>
                  <p className="text-2xl font-bold">{gameHistory.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">爆炸次数</p>
                  <p className="text-2xl font-bold text-destructive">
                    {gameHistory.filter(g => g.exploded).length}
                  </p>
                </div>
                <Bomb className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">
              {!gameActive && !isExploding ? '准备开始新一轮' : `第 ${roundNumber} 轮`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Round Stats */}
            {gameActive && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">本轮金币</p>
                  <p className="text-4xl font-bold text-primary">{currentCoins}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">已扎气球</p>
                  <p className="text-2xl font-bold">{popsCount} 次</p>
                </div>
              </div>
            )}

            {/* Balloon Display */}
            <div className="flex justify-center py-8">
              {isExploding ? (
                <div className="text-8xl animate-bounce">💥</div>
              ) : gameActive ? (
                <div className="text-8xl animate-pulse cursor-pointer hover:scale-110 transition-transform">
                  🎈
                </div>
              ) : (
                <div className="text-8xl opacity-50">🎈</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {!gameActive && !isExploding && (
                <Button 
                  onClick={startNewRound}
                  size="lg"
                  className="btn-glow"
                >
                  开始新一轮
                </Button>
              )}
              
              {gameActive && (
                <>
                  <Button
                    onClick={popBalloon}
                    size="lg"
                    className="btn-glow"
                  >
                    扎气球 (+10 金币)
                  </Button>
                  <Button
                    onClick={cashOut}
                    size="lg"
                    variant="outline"
                    disabled={currentCoins === 0}
                  >
                    兑现 ({currentCoins} 金币)
                  </Button>
                </>
              )}
            </div>

            {/* Finish Button */}
            {gameHistory.length >= 3 && !gameActive && !isExploding && (
              <div className="text-center pt-4">
                <Button
                  onClick={finishGame}
                  size="lg"
                  variant="default"
                >
                  完成游戏测试
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game History */}
        {gameHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>游戏记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">第 {game.round} 轮</span>
                      <span className="text-sm text-muted-foreground">
                        扎了 {game.pops} 次
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {game.exploded ? (
                        <>
                          <Bomb className="h-4 w-4 text-destructive" />
                          <span className="text-destructive font-medium">爆炸</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">+{game.coins}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BalloonGamePage;
