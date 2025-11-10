import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Gavel, TrendingUp, AlertTriangle, ChevronLeft, RotateCcw, Users } from 'lucide-react';

const AuctionGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [cash, setCash] = useState(500);
  const [startingPrice, setStartingPrice] = useState(10);
  const [actualValue, setActualValue] = useState(50);
  const [currentBid, setCurrentBid] = useState(0);
  const [userBid, setUserBid] = useState('');
  const [aiHighestBid, setAiHighestBid] = useState(0);
  const [marketHeat, setMarketHeat] = useState(50);
  const [anchorPrice, setAnchorPrice] = useState(0);
  const [roundHistory, setRoundHistory] = useState<{
    round: number;
    userBid: number;
    actualValue: number;
    profit: number;
    exited: boolean;
  }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const startNewGame = () => {
    setCash(500);
    setCurrentRound(1);
    setRoundHistory([]);
    startNewRound();
    setGameState('playing');
    setShowInstructions(false);
  };

  const startNewRound = () => {
    const newStartPrice = 10 + Math.floor(Math.random() * 20);
    const newActualValue = newStartPrice + Math.floor(Math.random() * 80);
    const newMarketHeat = 30 + Math.floor(Math.random() * 70);
    
    // 锚定陷阱：偶尔显示虚假高价历史
    const showAnchor = Math.random() > 0.6;
    const anchor = showAnchor ? newActualValue * (1.5 + Math.random() * 0.5) : 0;
    
    setStartingPrice(newStartPrice);
    setActualValue(newActualValue);
    setCurrentBid(newStartPrice);
    setAiHighestBid(newStartPrice);
    setMarketHeat(newMarketHeat);
    setAnchorPrice(anchor);
    setUserBid('');
    
    if (showAnchor) {
      toast({
        title: '📊 历史价格参考',
        description: `该资产历史最高价: ¥${anchor.toFixed(0)}`,
      });
    }
  };

  const simulateAiBid = (userBidAmount: number) => {
    // AI根据市场热度决定是否跟进
    const aiWillBid = Math.random() * 100 < marketHeat;
    
    if (aiWillBid) {
      const aiIncrease = 5 + Math.floor(Math.random() * 15);
      const newAiBid = userBidAmount + aiIncrease;
      setAiHighestBid(newAiBid);
      setCurrentBid(newAiBid);
      
      toast({
        title: '🤖 其他竞拍者出价',
        description: `当前最高价: ¥${newAiBid}`,
      });
      
      return true;
    }
    
    return false;
  };

  const placeBid = () => {
    const bidAmount = parseInt(userBid);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast({
        title: '无效出价',
        description: '请输入有效的金额',
        variant: 'destructive'
      });
      return;
    }
    
    if (bidAmount < currentBid + 5) {
      toast({
        title: '出价过低',
        description: `出价必须至少比当前价高 ¥5（当前: ¥${currentBid}）`,
        variant: 'destructive'
      });
      return;
    }
    
    if (bidAmount > cash) {
      toast({
        title: '资金不足',
        description: '您的现金不足以支付此出价',
        variant: 'destructive'
      });
      return;
    }
    
    setCurrentBid(bidAmount);
    
    // 模拟AI竞价
    setTimeout(() => {
      const aiResponded = simulateAiBid(bidAmount);
      if (!aiResponded) {
        toast({
          title: '✅ 竞拍成功',
          description: '没有其他竞拍者跟进，您赢得了此次拍卖',
        });
      }
    }, 1000);
  };

  const exitAuction = () => {
    // 退出拍卖，不花费任何金币
    const profit = 0;
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      userBid: 0,
      actualValue,
      profit,
      exited: true
    }]);
    
    toast({
      title: '退出拍卖',
      description: '您选择不参与此次拍卖',
    });
    
    nextRound();
  };

  const confirmPurchase = () => {
    if (currentBid === 0 || currentBid < startingPrice) {
      toast({
        title: '未出价',
        description: '请先出价或选择退出',
        variant: 'destructive'
      });
      return;
    }
    
    if (currentBid > cash) {
      toast({
        title: '资金不足',
        description: '您的现金不足以完成购买',
        variant: 'destructive'
      });
      return;
    }
    
    // 计算盈亏
    const profit = actualValue - currentBid;
    setCash(prev => prev - currentBid + actualValue);
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      userBid: currentBid,
      actualValue,
      profit,
      exited: false
    }]);
    
    if (profit > 0) {
      toast({
        title: '🎉 盈利！',
        description: `资产实际价值 ¥${actualValue}，您赚了 ¥${profit}`,
      });
    } else {
      toast({
        title: '📉 亏损',
        description: `资产实际价值 ¥${actualValue}，您亏了 ¥${Math.abs(profit)}`,
        variant: 'destructive'
      });
    }
    
    nextRound();
  };

  const nextRound = () => {
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startNewRound();
    }
  };

  const finishGame = () => {
    const totalProfit = cash - 500;
    const avgBidMultiple = roundHistory.filter(r => !r.exited).length > 0
      ? roundHistory.filter(r => !r.exited).reduce((sum, r) => sum + (r.userBid / startingPrice), 0) / roundHistory.filter(r => !r.exited).length
      : 0;
    const exitRate = (roundHistory.filter(r => r.exited).length / totalRounds) * 100;
    const lossCount = roundHistory.filter(r => !r.exited && r.profit < 0).length;
    
    // 计算贪婪分数 (0-100)
    const greedScore = Math.min(100, avgBidMultiple * 50);
    
    // 计算锚定偏差分数 (0-100，越低越好)
    const anchorBiasScore = 100 - exitRate;
    
    const gameResult = {
      finalCash: cash,
      totalProfit,
      totalRounds,
      participatedRounds: roundHistory.filter(r => !r.exited).length,
      exitRate,
      avgBidMultiple,
      lossCount,
      greedScore,
      anchorBiasScore,
      roundHistory,
      timestamp: Date.now()
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('auction')) {
      completedGames.push('auction');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('auctionResult', JSON.stringify(gameResult));
    
    setGameState('results');
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">🔨 拍卖竞价游戏</CardTitle>
            <CardDescription>测试您的贪婪程度与锚定偏差</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>初始资金 <strong className="text-primary">¥500</strong>，共 <strong className="text-primary">5 轮</strong>拍卖</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>每轮资产起拍价 ¥10-30，出价增幅至少 ¥5</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>AI模拟其他竞拍者，根据"市场热度"决定是否跟进</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>出价过高可能"爆仓"（资产实际价值低于出价则亏损）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>可随时退出锁定当前最低价，或继续竞价</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">6.</span>
                  <span>偶尔有<strong className="text-destructive">"锚定陷阱"</strong>，显示虚假高价历史诱导追高</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>捕捉贪婪（FOMO）和锚定偏差。贪婪者常追高，类似趋势跟踪中过度杠杆；
                  理性者早退，反映风险控制能力。
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
    const result = JSON.parse(localStorage.getItem('auctionResult') || '{}');
    
    return (
      <div className="min-h-screen p-4 xl:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/games')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回游戏中心
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">拍卖结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">最终资金</p>
                  <p className="text-2xl font-bold">¥{result.finalCash?.toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总盈亏</p>
                  <p className={`text-2xl font-bold ${result.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.totalProfit >= 0 ? '+' : ''}¥{result.totalProfit?.toFixed(0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">参与率</p>
                  <p className="text-2xl font-bold">
                    {result.participatedRounds} / {result.totalRounds}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">贪婪指数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">平均出价倍数</span>
                        <span className="font-bold">{result.avgBidMultiple?.toFixed(2)}x</span>
                      </div>
                      <Progress value={result.greedScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.greedScore?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.greedScore > 70 && '高贪婪 - 容易FOMO追高'}
                        {result.greedScore > 40 && result.greedScore <= 70 && '中等贪婪 - 有一定风险意识'}
                        {result.greedScore <= 40 && '低贪婪 - 理性控制风险'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">锚定偏差</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">早退率</span>
                        <span className="font-bold">{result.exitRate?.toFixed(0)}%</span>
                      </div>
                      <Progress value={result.anchorBiasScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.anchorBiasScore?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.anchorBiasScore > 70 && '高锚定偏差 - 容易受历史价格影响'}
                        {result.anchorBiasScore > 40 && result.anchorBiasScore <= 70 && '中等锚定偏差'}
                        {result.anchorBiasScore <= 40 && '低锚定偏差 - 独立判断能力强'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">拍卖记录</h4>
                <div className="space-y-2">
                  {result.roundHistory?.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">第 {record.round} 轮</span>
                      <span className="font-medium">
                        {record.exited ? '退出' : `出价 ¥${record.userBid}`}
                      </span>
                      <span className={`font-bold ${record.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {record.exited ? '-' : `${record.profit >= 0 ? '+' : ''}¥${record.profit}`}
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
              <span className="flex items-center gap-2">
                <Gavel className="h-6 w-6 text-purple-500" />
                拍卖进度
              </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">剩余资金</p>
                <p className="text-3xl font-bold text-primary">¥{cash}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">市场热度</p>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <p className="text-3xl font-bold text-orange-500">{marketHeat}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anchor Price Warning */}
        {anchorPrice > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-semibold">历史价格参考</p>
                  <p className="text-sm text-muted-foreground">
                    该资产历史最高价: <strong className="text-yellow-500">¥{anchorPrice.toFixed(0)}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auction Info */}
        <Card>
          <CardHeader>
            <CardTitle>当前拍卖</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">起拍价</p>
                <p className="text-2xl font-bold">¥{startingPrice}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">当前最高价</p>
                <p className="text-2xl font-bold text-primary">¥{currentBid}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">您的出价（至少比当前价高 ¥5）</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={userBid}
                  onChange={(e) => setUserBid(e.target.value)}
                  placeholder={`最低 ¥${currentBid + 5}`}
                  min={currentBid + 5}
                />
                <Button onClick={placeBid} className="btn-glow">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  出价
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>决策</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={exitAuction}
                size="lg"
                variant="outline"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                退出拍卖
              </Button>
              <Button 
                onClick={confirmPurchase}
                size="lg"
                className="btn-glow"
                disabled={currentBid === 0 || currentBid < startingPrice}
              >
                <Gavel className="mr-2 h-4 w-4" />
                确认购买
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Round History */}
        {roundHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>历史记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roundHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span className="text-muted-foreground">第 {record.round} 轮</span>
                    <span className="font-medium">
                      {record.exited ? '退出' : `出价 ¥${record.userBid}`}
                    </span>
                    <span className={`font-bold ${record.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {record.exited ? '-' : `${record.profit >= 0 ? '+' : ''}¥${record.profit}`}
                    </span>
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

export default AuctionGamePage;
