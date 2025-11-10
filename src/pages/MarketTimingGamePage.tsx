import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, DollarSign, ChevronLeft, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketTimingGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [currentDay, setCurrentDay] = useState(0);
  const [cash, setCash] = useState(10000);
  const [shares, setShares] = useState(0);
  const [priceHistory, setPriceHistory] = useState<{ day: number; price: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [transactions, setTransactions] = useState<{
    day: number;
    type: 'buy' | 'sell';
    price: number;
    shares: number;
  }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const totalDays = 30;

  // 生成市场价格走势（模拟真实市场波动）
  const generateMarketData = () => {
    const data: { day: number; price: number }[] = [];
    let price = 100;
    
    // 创建一个有趋势的市场：前期下跌，中期震荡，后期上涨
    for (let day = 0; day <= totalDays; day++) {
      if (day < 10) {
        // 前期：下跌趋势 + 随机波动
        price = price * (0.97 + Math.random() * 0.02);
      } else if (day < 20) {
        // 中期：震荡
        price = price * (0.98 + Math.random() * 0.04);
      } else {
        // 后期：上涨趋势
        price = price * (1.01 + Math.random() * 0.03);
      }
      data.push({ day, price: Math.round(price * 100) / 100 });
    }
    
    return data;
  };

  const startGame = () => {
    const marketData = generateMarketData();
    setPriceHistory(marketData);
    setCurrentPrice(marketData[0].price);
    setCurrentDay(0);
    setCash(10000);
    setShares(0);
    setTransactions([]);
    setGameState('playing');
    setShowInstructions(false);
  };

  const nextDay = () => {
    if (currentDay < totalDays) {
      const newDay = currentDay + 1;
      setCurrentDay(newDay);
      setCurrentPrice(priceHistory[newDay].price);
    } else {
      finishGame();
    }
  };

  const buyShares = () => {
    const maxShares = Math.floor(cash / currentPrice);
    if (maxShares > 0) {
      const sharesToBuy = Math.min(100, maxShares); // 每次最多买100股
      const cost = sharesToBuy * currentPrice;
      
      setCash(cash - cost);
      setShares(shares + sharesToBuy);
      setTransactions([...transactions, {
        day: currentDay,
        type: 'buy',
        price: currentPrice,
        shares: sharesToBuy
      }]);
      
      toast({
        title: '买入成功',
        description: `以 ¥${currentPrice.toFixed(2)} 买入 ${sharesToBuy} 股`,
      });
      
      nextDay();
    } else {
      toast({
        title: '现金不足',
        description: '没有足够的现金购买股票',
        variant: 'destructive'
      });
    }
  };

  const sellShares = () => {
    if (shares > 0) {
      const sharesToSell = Math.min(100, shares); // 每次最多卖100股
      const revenue = sharesToSell * currentPrice;
      
      setCash(cash + revenue);
      setShares(shares - sharesToSell);
      setTransactions([...transactions, {
        day: currentDay,
        type: 'sell',
        price: currentPrice,
        shares: sharesToSell
      }]);
      
      toast({
        title: '卖出成功',
        description: `以 ¥${currentPrice.toFixed(2)} 卖出 ${sharesToSell} 股`,
      });
      
      nextDay();
    } else {
      toast({
        title: '没有持仓',
        description: '您当前没有持有股票',
        variant: 'destructive'
      });
    }
  };

  const hold = () => {
    toast({
      title: '持有观望',
      description: '今天不进行交易',
    });
    nextDay();
  };

  const finishGame = () => {
    // 强制卖出所有持仓
    const finalValue = cash + (shares * currentPrice);
    const profit = finalValue - 10000;
    const profitRate = (profit / 10000) * 100;
    
    // 计算交易指标
    const buyCount = transactions.filter(t => t.type === 'buy').length;
    const sellCount = transactions.filter(t => t.type === 'sell').length;
    const avgBuyPrice = buyCount > 0 
      ? transactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.price, 0) / buyCount 
      : 0;
    const avgSellPrice = sellCount > 0
      ? transactions.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.price, 0) / sellCount
      : 0;
    
    // 保存游戏结果
    const gameResult = {
      finalValue,
      profit,
      profitRate,
      transactions: transactions.length,
      buyCount,
      sellCount,
      avgBuyPrice,
      avgSellPrice,
      patience: totalDays - transactions.length, // 未交易天数
      timing: avgSellPrice > avgBuyPrice ? 'good' : 'poor'
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('market-timing')) {
      completedGames.push('market-timing');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('marketTimingResult', JSON.stringify(gameResult));
    
    setGameState('results');
    
    toast({
      title: '游戏结束',
      description: `最终收益: ${profit >= 0 ? '+' : ''}¥${profit.toFixed(2)} (${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%)`,
      variant: profit >= 0 ? 'default' : 'destructive'
    });
  };

  const totalValue = cash + (shares * currentPrice);
  const profit = totalValue - 10000;
  const profitRate = (profit / 10000) * 100;

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">📈 市场时机游戏</CardTitle>
            <CardDescription>测试您的市场判断和交易时机把握能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>您有 <strong className="text-primary">¥10,000</strong> 初始资金</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>游戏持续 <strong className="text-primary">30 天</strong>，每天可以选择买入、卖出或持有</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>每次交易最多 100 股</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>市场价格每天波动，您需要判断最佳买卖时机</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>游戏结束时自动卖出所有持仓，计算最终收益</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估您的市场时机把握能力、交易频率偏好和耐心程度。
                  这将帮助我们了解您的交易风格。
                </p>
              </div>
            </div>

            <Button 
              onClick={startGame} 
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
    const finalValue = cash + (shares * currentPrice);
    const finalProfit = finalValue - 10000;
    const finalProfitRate = (finalProfit / 10000) * 100;
    
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
                  <p className="text-2xl font-bold">¥{finalValue.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总收益</p>
                  <p className={`text-2xl font-bold ${finalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {finalProfit >= 0 ? '+' : ''}¥{finalProfit.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">收益率</p>
                  <p className={`text-2xl font-bold ${finalProfitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {finalProfitRate >= 0 ? '+' : ''}{finalProfitRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: '天数', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: '价格', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">交易记录</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {transactions.map((t, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">第 {t.day} 天</span>
                        {t.type === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {t.type === 'buy' ? '买入' : '卖出'} {t.shares} 股
                        </span>
                      </div>
                      <span className="text-sm">¥{t.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={startGame} className="flex-1" variant="outline">
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

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">第几天</p>
                <p className="text-2xl font-bold">{currentDay + 1} / {totalDays}</p>
              </div>
            </CardContent>
          </Card>
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

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle>市场走势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory.slice(0, currentDay + 1)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">当前价格</p>
              <p className="text-3xl font-bold text-primary">¥{currentPrice.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>今天的决策</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={buyShares}
                size="lg"
                className="btn-glow"
                disabled={cash < currentPrice}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                买入 (最多100股)
              </Button>
              <Button 
                onClick={sellShares}
                size="lg"
                variant="outline"
                disabled={shares === 0}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                卖出 (最多100股)
              </Button>
              <Button 
                onClick={hold}
                size="lg"
                variant="secondary"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                持有观望
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">当前收益</p>
                <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profit >= 0 ? '+' : ''}¥{profit.toFixed(2)} ({profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">交易次数</p>
                <p className="text-xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketTimingGamePage;
