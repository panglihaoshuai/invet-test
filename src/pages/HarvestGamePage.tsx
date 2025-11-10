import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Sprout, TrendingUp, AlertTriangle, ChevronLeft, RotateCcw, Zap } from 'lucide-react';

const HarvestGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [investment, setInvestment] = useState(100);
  const [currentValue, setCurrentValue] = useState(100);
  const [growthCycle, setGrowthCycle] = useState(20);
  const [boosted, setBoosted] = useState(false);
  const [stormRisk, setStormRisk] = useState(0);
  const [gameHistory, setGameHistory] = useState<{
    round: number;
    action: 'harvest' | 'wait' | 'boost' | 'storm';
    value: number;
  }[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const startNewGame = () => {
    // 随机生成成长周期 (10-30轮)
    const cycle = Math.floor(Math.random() * 21) + 10;
    setGrowthCycle(cycle);
    setCurrentRound(0);
    setInvestment(100);
    setCurrentValue(100);
    setBoosted(false);
    setStormRisk(0);
    setGameState('playing');
    setShowInstructions(false);
    setTotalGames(prev => prev + 1);
  };

  const calculateGrowth = () => {
    // 每轮增长 5-15%
    const growthRate = 0.05 + Math.random() * 0.10;
    const boostMultiplier = boosted ? 1.5 : 1;
    return growthRate * boostMultiplier;
  };

  const nextRound = () => {
    if (currentRound >= growthCycle) {
      return;
    }

    const growth = calculateGrowth();
    const newValue = currentValue * (1 + growth);
    
    // 增加风暴风险（越接近成熟期风险越高）
    const progressRatio = currentRound / growthCycle;
    const newStormRisk = Math.min(30, progressRatio * 40);
    
    // 检查是否发生风暴
    const stormHappens = Math.random() * 100 < newStormRisk;
    
    if (stormHappens) {
      // 风暴减值 20-50%
      const stormDamage = 0.2 + Math.random() * 0.3;
      const damagedValue = newValue * (1 - stormDamage);
      
      setCurrentValue(damagedValue);
      setGameHistory(prev => [...prev, {
        round: currentRound + 1,
        action: 'storm',
        value: damagedValue
      }]);
      
      toast({
        title: '⚠️ 遭遇风暴！',
        description: `资产减值 ${(stormDamage * 100).toFixed(0)}%，当前价值: ${damagedValue.toFixed(2)} 金币`,
        variant: 'destructive'
      });
    } else {
      setCurrentValue(newValue);
      setGameHistory(prev => [...prev, {
        round: currentRound + 1,
        action: 'wait',
        value: newValue
      }]);
      
      toast({
        title: '🌱 继续成长',
        description: `增长 ${(growth * 100).toFixed(1)}%，当前价值: ${newValue.toFixed(2)} 金币`,
      });
    }
    
    setCurrentRound(prev => prev + 1);
    setStormRisk(newStormRisk);
    setBoosted(false);
  };

  const harvest = () => {
    const profit = currentValue - investment;
    const profitRate = (profit / investment) * 100;
    
    setGameHistory(prev => [...prev, {
      round: currentRound,
      action: 'harvest',
      value: currentValue
    }]);
    
    toast({
      title: '✅ 收获成功！',
      description: `获得 ${currentValue.toFixed(2)} 金币，收益率: ${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`,
    });
    
    saveGameResult();
    setGameState('results');
  };

  const boost = () => {
    if (boosted) {
      toast({
        title: '已经加注',
        description: '本轮已经使用过加注',
        variant: 'destructive'
      });
      return;
    }
    
    setBoosted(true);
    setStormRisk(prev => prev + 10); // 增加风暴风险
    
    setGameHistory(prev => [...prev, {
      round: currentRound,
      action: 'boost',
      value: currentValue
    }]);
    
    toast({
      title: '⚡ 加注成功',
      description: '下一轮成长速度提升50%，但风暴风险增加',
    });
    
    nextRound();
  };

  const saveGameResult = () => {
    const waitRounds = gameHistory.filter(h => h.action === 'wait').length;
    const boostCount = gameHistory.filter(h => h.action === 'boost').length;
    const stormCount = gameHistory.filter(h => h.action === 'storm').length;
    const harvestRound = currentRound;
    const profit = currentValue - investment;
    const profitRate = (profit / investment) * 100;
    
    // 计算耐心分数 (0-100)
    const patienceScore = Math.min(100, (harvestRound / growthCycle) * 100);
    
    // 计算冒险偏好 (0-100)
    const riskScore = Math.min(100, (boostCount / Math.max(1, harvestRound)) * 200);
    
    const gameResult = {
      investment,
      finalValue: currentValue,
      profit,
      profitRate,
      growthCycle,
      harvestRound,
      waitRounds,
      boostCount,
      stormCount,
      patienceScore,
      riskScore,
      totalGames,
      timestamp: Date.now()
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('harvest')) {
      completedGames.push('harvest');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    
    // 累积历史数据
    const allResults = JSON.parse(localStorage.getItem('harvestResults') || '[]');
    allResults.push(gameResult);
    localStorage.setItem('harvestResults', JSON.stringify(allResults));
    localStorage.setItem('harvestResult', JSON.stringify(gameResult));
  };

  const progressPercentage = (currentRound / growthCycle) * 100;
  const profit = currentValue - investment;
  const profitRate = (profit / investment) * 100;

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">🌾 等待收获游戏</CardTitle>
            <CardDescription>测试您的耐心与纪律性</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>初始投资 <strong className="text-primary">100 金币</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>成长周期随机 <strong className="text-primary">10-30 轮</strong>，每轮增长 5-15% 收益</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>可随时"收获"锁定当前收益，但早收获会损失潜在收益</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>等太久可能遇到<strong className="text-destructive">"风暴"事件</strong>，减值 20-50%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>可选择"加注"增加成长速度 50%，但会提高风暴风险</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估您的持有耐力和风险偏好。高耐心者倾向等满周期，反映价值投资心态；
                  低耐心者早收获，类似波段或超短线交易者。
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
    const result = JSON.parse(localStorage.getItem('harvestResult') || '{}');
    
    return (
      <div className="min-h-screen p-4 xl:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/games')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回游戏中心
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">收获结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">最终价值</p>
                  <p className="text-2xl font-bold">¥{result.finalValue?.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总收益</p>
                  <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.profit >= 0 ? '+' : ''}¥{result.profit?.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">收益率</p>
                  <p className={`text-2xl font-bold ${result.profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.profitRate >= 0 ? '+' : ''}{result.profitRate?.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">耐心指数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">等待轮数</span>
                        <span className="font-bold">{result.harvestRound} / {result.growthCycle}</span>
                      </div>
                      <Progress value={result.patienceScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.patienceScore?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.patienceScore > 80 && '极高耐心 - 适合长线价值投资'}
                        {result.patienceScore > 60 && result.patienceScore <= 80 && '较高耐心 - 适合中长线投资'}
                        {result.patienceScore > 40 && result.patienceScore <= 60 && '中等耐心 - 适合波段交易'}
                        {result.patienceScore <= 40 && '较低耐心 - 适合短线交易'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">冒险指数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">加注次数</span>
                        <span className="font-bold">{result.boostCount}</span>
                      </div>
                      <Progress value={result.riskScore} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.riskScore?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.riskScore > 60 && '高风险偏好 - 激进型投资者'}
                        {result.riskScore > 30 && result.riskScore <= 60 && '中等风险偏好 - 平衡型投资者'}
                        {result.riskScore <= 30 && '低风险偏好 - 保守型投资者'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">游戏统计</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>等待轮数: {result.waitRounds}</div>
                  <div>加注次数: {result.boostCount}</div>
                  <div>遭遇风暴: {result.stormCount} 次</div>
                  <div>完成度: {((result.harvestRound / result.growthCycle) * 100).toFixed(0)}%</div>
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
                <Sprout className="h-6 w-6 text-green-500" />
                成长进度
              </span>
              <span className="text-sm text-muted-foreground">
                第 {currentRound} / {growthCycle} 轮
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="h-4" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">成熟度</p>
              <p className="text-2xl font-bold text-primary">{progressPercentage.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">当前价值</p>
                <p className="text-3xl font-bold text-primary">¥{currentValue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">当前收益</p>
                <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profit >= 0 ? '+' : ''}¥{profit.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">收益率</p>
                <p className={`text-3xl font-bold ${profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Warning */}
        {stormRisk > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-semibold">风暴风险</p>
                  <Progress value={stormRisk} className="h-2 mt-2" />
                </div>
                <span className="text-2xl font-bold text-yellow-500">{stormRisk.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>您的决策</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={nextRound}
                size="lg"
                variant="outline"
                disabled={currentRound >= growthCycle}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                继续等待
              </Button>
              <Button 
                onClick={boost}
                size="lg"
                variant="secondary"
                disabled={boosted || currentRound >= growthCycle}
              >
                <Zap className="mr-2 h-4 w-4" />
                加注 (+50%速度)
              </Button>
              <Button 
                onClick={harvest}
                size="lg"
                className="btn-glow"
              >
                <Sprout className="mr-2 h-4 w-4" />
                立即收获
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game History */}
        {gameHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>成长记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {gameHistory.slice().reverse().map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span className="text-muted-foreground">第 {record.round} 轮</span>
                    <span className="font-medium">
                      {record.action === 'wait' && '🌱 继续成长'}
                      {record.action === 'boost' && '⚡ 加注'}
                      {record.action === 'storm' && '⚠️ 遭遇风暴'}
                      {record.action === 'harvest' && '✅ 收获'}
                    </span>
                    <span className="font-bold">¥{record.value.toFixed(2)}</span>
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

export default HarvestGamePage;
