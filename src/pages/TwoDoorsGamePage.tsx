import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { DoorOpen, Shield, Zap, ChevronLeft, RotateCcw } from 'lucide-react';

const TwoDoorsGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [totalCoins, setTotalCoins] = useState(0);
  const [selectedDoor, setSelectedDoor] = useState<'A' | 'B' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [roundHistory, setRoundHistory] = useState<{
    round: number;
    initialChoice: 'A' | 'B';
    finalChoice: 'A' | 'B';
    switched: boolean;
    result: number;
  }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const startNewGame = () => {
    setTotalCoins(0);
    setCurrentRound(1);
    setRoundHistory([]);
    setSelectedDoor(null);
    setShowHint(false);
    setGameState('playing');
    setShowInstructions(false);
  };

  const selectDoor = (door: 'A' | 'B') => {
    setSelectedDoor(door);
    
    // 显示提示
    setTimeout(() => {
      setShowHint(true);
      toast({
        title: '💡 提示',
        description: '另一扇门可能更好，您要切换吗？',
      });
    }, 500);
  };

  const switchDoor = () => {
    if (!selectedDoor) return;
    
    const newDoor = selectedDoor === 'A' ? 'B' : 'A';
    setSelectedDoor(newDoor);
    
    toast({
      title: '🔄 已切换',
      description: `切换到门 ${newDoor}`,
    });
  };

  const confirmChoice = () => {
    if (!selectedDoor) {
      toast({
        title: '请选择',
        description: '请先选择一扇门',
        variant: 'destructive'
      });
      return;
    }

    const initialChoice = selectedDoor === 'A' ? 'A' : 'B';
    let result = 0;
    
    if (selectedDoor === 'A') {
      // 门A：固定+20金币
      result = 20;
    } else {
      // 门B：50% +50金币，50% 损失当前总资金的30%
      if (Math.random() > 0.5) {
        result = 50;
      } else {
        // 损失当前总资金的30%
        result = -Math.floor(totalCoins * 0.3);
      }
    }
    
    setTotalCoins(prev => prev + result);
    
    const switched = showHint && initialChoice !== selectedDoor;
    
    setRoundHistory(prev => [...prev, {
      round: currentRound,
      initialChoice,
      finalChoice: selectedDoor,
      switched,
      result
    }]);
    
    if (result > 0) {
      toast({
        title: '✅ 获得金币',
        description: `+${result} 金币`,
      });
    } else {
      toast({
        title: '📉 损失金币',
        description: `${result} 金币`,
        variant: 'destructive'
      });
    }
    
    // 下一轮
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      setSelectedDoor(null);
      setShowHint(false);
    }
  };

  const finishGame = () => {
    const doorBChoices = roundHistory.filter(r => r.finalChoice === 'B').length;
    const switchCount = roundHistory.filter(r => r.switched).length;
    const doorBRate = (doorBChoices / totalRounds) * 100;
    const switchRate = (switchCount / totalRounds) * 100;
    
    // 计算风险容忍度 (0-100)
    const riskTolerance = doorBRate;
    
    // 计算现状偏差 (0-100，越低越好)
    const statusQuoBias = 100 - switchRate;
    
    const gameResult = {
      totalCoins,
      totalRounds,
      doorBChoices,
      switchCount,
      doorBRate,
      switchRate,
      riskTolerance,
      statusQuoBias,
      roundHistory,
      timestamp: Date.now()
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('two-doors')) {
      completedGames.push('two-doors');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('twoDoorsResult', JSON.stringify(gameResult));
    
    setGameState('results');
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">🚪 双门选择游戏</CardTitle>
            <CardDescription>测试您的损失厌恶与决策偏差</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>共 <strong className="text-primary">10 轮</strong>，每轮面对两扇门</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span><strong className="text-green-500">门A</strong>：固定 <strong>+20 金币</strong>（安全）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span><strong className="text-red-500">门B</strong>：50% 概率 <strong>+50 金币</strong>，50% 概率 <strong>损失当前总资金的30%</strong>（风险）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>选择后会显示提示，您可以切换选择</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估损失厌恶（更怕亏本而选安全门）和现状偏差（不愿切换）。
                  高损失厌恶者偏好门A，类似保守价值投资；冒险者选B，反映期权或杠杆偏好。
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
    const result = JSON.parse(localStorage.getItem('twoDoorsResult') || '{}');
    
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
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">总金币</p>
                <p className={`text-4xl font-bold ${result.totalCoins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {result.totalCoins >= 0 ? '+' : ''}{result.totalCoins}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">风险容忍度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">选择门B次数</span>
                        <span className="font-bold">{result.doorBChoices} / {result.totalRounds}</span>
                      </div>
                      <Progress value={result.riskTolerance} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.riskTolerance?.toFixed(0)}%
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.riskTolerance > 60 && '高风险容忍 - 激进型投资者'}
                        {result.riskTolerance > 30 && result.riskTolerance <= 60 && '中等风险容忍 - 平衡型投资者'}
                        {result.riskTolerance <= 30 && '低风险容忍 - 保守型投资者'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">现状偏差</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">切换次数</span>
                        <span className="font-bold">{result.switchCount} / {result.totalRounds}</span>
                      </div>
                      <Progress value={result.statusQuoBias} className="h-3" />
                      <p className="text-center text-2xl font-bold text-primary">
                        {result.statusQuoBias?.toFixed(0)}分
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        {result.statusQuoBias > 70 && '高现状偏差 - 不愿改变决策'}
                        {result.statusQuoBias > 40 && result.statusQuoBias <= 70 && '中等现状偏差'}
                        {result.statusQuoBias <= 40 && '低现状偏差 - 灵活调整策略'}
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
                        门{record.finalChoice} {record.switched && '(切换)'}
                      </span>
                      <span className={`font-bold ${record.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {record.result >= 0 ? '+' : ''}{record.result}
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

        {/* Current Coins */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">当前金币</p>
              <p className={`text-4xl font-bold ${totalCoins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalCoins >= 0 ? '+' : ''}{totalCoins}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Door Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all ${selectedDoor === 'A' ? 'border-green-500 border-2' : 'hover:border-primary'}`}
            onClick={() => !showHint && selectDoor('A')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <Shield className="h-6 w-6" />
                门 A - 安全
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-500">+20</p>
                <p className="text-sm text-muted-foreground mt-2">固定收益</p>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                稳定但收益较低
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${selectedDoor === 'B' ? 'border-red-500 border-2' : 'hover:border-primary'}`}
            onClick={() => !showHint && selectDoor('B')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Zap className="h-6 w-6" />
                门 B - 风险
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-500">+50</p>
                <p className="text-sm text-muted-foreground">或</p>
                <p className="text-2xl font-bold text-red-500">-30%总资金</p>
                <p className="text-sm text-muted-foreground mt-2">50% 概率</p>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                高风险高回报
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hint and Actions */}
        {showHint && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-center font-semibold">
                  💡 另一扇门可能更好，您要切换吗？
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={switchDoor} size="lg" variant="outline">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    切换选择
                  </Button>
                  <Button onClick={confirmChoice} size="lg" className="btn-glow">
                    确认选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showHint && selectedDoor && (
          <Button onClick={confirmChoice} size="lg" className="w-full btn-glow">
            确认选择门 {selectedDoor}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TwoDoorsGamePage;
