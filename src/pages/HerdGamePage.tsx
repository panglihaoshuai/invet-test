import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, TrendingDown, ChevronLeft, RotateCcw } from 'lucide-react';

const HerdGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(8);
  const [cash, setCash] = useState(1000);
  const [shares, setShares] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [herdPercentage, setHerdPercentage] = useState(50);
  const [herdAction, setHerdAction] = useState<'买入' | '卖出'>('买入');
  const [actualTrend, setActualTrend] = useState<'up' | 'down'>('up');
  const [roundHistory, setRoundHistory] = useState<{
    round: number;
    action: 'buy' | 'sell' | 'hold';
    followedHerd: boolean;
    price: number;
    result: number;
  }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const startNewGame = () => {
    setCash(1000);
    setShares(0);
    setCurrentRound(1);
    setRoundHistory([]);
    startNewRound();
    setGameState('playing');
    setShowInstructions(false);
  };

  const startNewRound = () => {
    const newPrice = 80 + Math.floor(Math.random() * 40);
    const newHerdPercentage = 60 + Math.floor(Math.random() * 30);
    const newHerdAction = Math.random() > 0.5 ? '买入' : '卖出';
    const newActualTrend = Math.random() > 0.4 ? 'up' : 'down'; // 60% 上涨，40% 下跌
    
    setCurrentPrice(newPrice);
    setHerdPercentage(newHerdPercentage);
    setHerdAction(newHerdAction);
    setActualTrend(newActualTrend);
  };

  const executeAction = (action: 'buy' | 'sell' | 'hold') => {
    const followedHerd = (action === 'buy' && herdAction === '买入') || (action === 'sell' && herdAction === '卖出');
    
    let result = 0;
    let newPrice = currentPrice;
    
    // 计算价格变化
    if (actualTrend === 'up') {
      newPrice = currentPrice * (1.1 + Math.random() * 0.1);
    } else {
      newPrice = currentPrice * (0.9 - Math.random() * 0.1);
    }
    
    // 执行交易
    if (action === 'buy') {
      const sharesToBuy = Math.floor(cash / currentPrice);
      if (sharesToBuy > 0) {
        setShares(prev => prev + sharesToBuy);
        setCash(prev => prev - sharesToBuy * currentPrice);
        result = sharesToBuy * (newPrice - currentPrice);
        
        toast({
          title: '买入成功',
          description: `以 ¥${currentPrice.toFixed(2)} 买入 ${sharesToBuy} 股`,
        });
      } else {
        toast({
          title: '资金不足',
          description: '没有足够的现金购买股票',
          variant: 'destructive'
        });
        return;
      }
    } else if (action === 'sell') {
      if (shares > 0) {
        const revenue = shares * currentPrice;
        setCash(prev => prev + revenue);
        result = shares * (currentPrice - (currentPrice / 1.1)); // 简化计算
        setShares(0);
        
        toast({
          title: '卖出成功',
          description: `以 ¥${currentPrice.toFixed(2)} 卖出 ${shares} 股`,
        });
      } else {
        toast({
          title: '没有持仓',
          description: '您当前没有持有股票',
          variant: 'destructive'
        });
        return;
      }
    } else {
      // 持有
      result = shares * (newPrice - currentPrice);
      
      toast({
        title: '持有观望',
        description: '本轮不进行交易',
      });
    }
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      action,
      followedHerd,
      price: currentPrice,
      result
    }]);
    
    setCurrentPrice(newPrice);
    
    // 下一轮
    if (currentRound >= totalRounds) {
      finishGame(newPrice);
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const finishGame = (finalPrice: number) => {
    const finalValue = cash + (shares * finalPrice);
    const totalProfit = finalValue - 1000;
    const followHerdCount = roundHistory.filter(r => r.followedHerd).length;
    const independentCount = roundHistory.filter(r => !r.followedHerd).length;
    const followHerdRate = (followHerdCount / totalRounds) * 100;
    
    // 计算从众指数 (0-100)
    const herdScore = followHerdRate;
    
    // 计算独立决策胜率
    const independentWins = roundHistory.filter(r => !r.followedHerd && r.result > 0).length;
    const independentWinRate = independentCount > 0 ? (independentWins / independentCount) * 100 : 0;
    
    const gameResult = {
      finalValue,
      totalProfit,
      totalRounds,
      followHerdCount,
      independentCount,
      followHerdRate,
      independentWinRate,
      herdScore,
      roundHistory,
      timestamp: Date.now()
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('herd')) {
      completedGames.push('herd');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('herdResult', JSON.stringify(gameResult));
    
    setGameState('results');
  };

  const totalValue = cash + (shares * currentPrice);
  const profit = totalValue - 1000;

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">👥 群体羊群游戏</CardTitle>
            <CardDescription>测试您的从众心理与独立思考能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>初始资金 <strong className="text-primary">¥1,000</strong>，共 <strong className="text-primary">8 轮</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>每轮显示"羊群指标"，如"80%交易者正在买入"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>您可以选择跟随群体、反向操作或持有观望</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>实际结果随机，<strong className="text-destructive">从众可能导致集体亏损</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>游戏结束时计算最终收益和决策独立性</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>识别从众偏好（羊群效应）。从众者跟风，类似社交媒体驱动的趋势跟踪；
                  独立者反向操作，反映逆向投资心态。
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

  if (gameState === 'results') {
    const result = JSON.parse(localStorage.getItem('herdResult') || '{}');
    
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
                  <p className="text-sm text-muted-foreground mb-2">最终资产</p>
                  <p className="text-2xl font-bold">¥{result.finalValue?.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总盈亏</p>
                  <p className={`text-2xl font-bold ${result.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.totalProfit >= 0 ? '+' : ''}¥{result.totalProfit?.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">收益率</p>
                  <p className={`text-2xl font-bold ${result.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.totalProfit >= 0 ? '+' : ''}{((result.totalProfit / 1000) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">从众指数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">跟随群体次数</span>
                        <span className="font-bold">{result.followHerdCount} / {result.totalRounds}</span>
                      </div>
                      <Progress value={result.herdScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.herdScore?.toFixed(0)}%
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.herdScore > 70 && '高从众 - 容易受群体影响'}
                        {result.herdScore > 40 && result.herdScore <= 70 && '中等从众 - 部分独立思考'}
                        {result.herdScore <= 40 && '低从众 - 独立决策能力强'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">独立决策胜率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">独立决策次数</span>
                        <span className="font-bold">{result.independentCount}</span>
                      </div>
                      <Progress value={result.independentWinRate} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.independentWinRate?.toFixed(0)}%
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        独立决策的成功率
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">交易记录</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.roundHistory?.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">第 {record.round} 轮</span>
                      <span className="font-medium">
                        {record.action === 'buy' && '买入'}
                        {record.action === 'sell' && '卖出'}
                        {record.action === 'hold' && '持有'}
                        {record.followedHerd && ' (跟随)'}
                      </span>
                      <span className={`font-bold ${record.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {record.result >= 0 ? '+' : ''}¥{record.result?.toFixed(0)}
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

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">现金</p>
                <p className="text-2xl font-bold text-green-500">¥{cash.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">持仓</p>
                <p className="text-2xl font-bold">{shares} 股</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">总资产</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ¥{totalValue.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Herd Indicator */}
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-orange-500" />
              羊群指标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500 mb-2">{herdPercentage}%</p>
              <p className="text-lg">
                交易者正在<strong className={herdAction === '买入' ? 'text-green-500' : 'text-red-500'}>{herdAction}</strong>
              </p>
            </div>
            <Progress value={herdPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Market Info */}
        <Card>
          <CardHeader>
            <CardTitle>市场信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">当前价格</p>
              <p className="text-3xl font-bold text-primary">¥{currentPrice.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>您的决策</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => executeAction('buy')}
                size="lg"
                className="btn-glow"
                disabled={cash < currentPrice}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                买入
              </Button>
              <Button 
                onClick={() => executeAction('sell')}
                size="lg"
                variant="outline"
                disabled={shares === 0}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                卖出
              </Button>
              <Button 
                onClick={() => executeAction('hold')}
                size="lg"
                variant="secondary"
              >
                持有观望
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Profit */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">当前盈亏</p>
              <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : ''}¥{profit.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HerdGamePage;
