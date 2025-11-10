import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { PieChart, ChevronLeft, RotateCcw, TrendingUp } from 'lucide-react';

interface AssetClass {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  risk: number;
  color: string;
}

const PortfolioAllocationGamePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'instructions' | 'allocating' | 'results'>('instructions');
  const [allocations, setAllocations] = useState<Record<string, number>>({
    stocks: 25,
    bonds: 25,
    realestate: 25,
    cash: 25
  });
  const [showInstructions, setShowInstructions] = useState(true);

  const assetClasses: AssetClass[] = [
    {
      id: 'stocks',
      name: '股票',
      description: '高风险高回报，适合长期投资',
      expectedReturn: 10,
      risk: 20,
      color: 'bg-blue-500'
    },
    {
      id: 'bonds',
      name: '债券',
      description: '中等风险中等回报，相对稳定',
      expectedReturn: 5,
      risk: 8,
      color: 'bg-green-500'
    },
    {
      id: 'realestate',
      name: '房地产',
      description: '中高风险，抗通胀能力强',
      expectedReturn: 7,
      risk: 12,
      color: 'bg-purple-500'
    },
    {
      id: 'cash',
      name: '现金',
      description: '低风险低回报，流动性最高',
      expectedReturn: 2,
      risk: 1,
      color: 'bg-yellow-500'
    }
  ];

  const handleAllocationChange = (assetId: string, value: number[]) => {
    const newValue = value[0];
    const oldValue = allocations[assetId];
    const diff = newValue - oldValue;
    
    // 计算其他资产的总配置
    const otherAssets = Object.keys(allocations).filter(id => id !== assetId);
    const otherTotal = otherAssets.reduce((sum, id) => sum + allocations[id], 0);
    
    if (otherTotal - diff < 0) {
      toast({
        title: '配置超限',
        description: '总配置不能超过100%',
        variant: 'destructive'
      });
      return;
    }
    
    // 按比例调整其他资产
    const newAllocations = { ...allocations, [assetId]: newValue };
    const adjustmentRatio = otherTotal > 0 ? (otherTotal - diff) / otherTotal : 0;
    
    otherAssets.forEach(id => {
      newAllocations[id] = Math.round(allocations[id] * adjustmentRatio);
    });
    
    // 确保总和为100
    const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const adjustment = 100 - total;
      newAllocations[otherAssets[0]] += adjustment;
    }
    
    setAllocations(newAllocations);
  };

  const startGame = () => {
    setGameState('allocating');
    setShowInstructions(false);
  };

  const submitAllocation = () => {
    const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    
    if (total !== 100) {
      toast({
        title: '配置错误',
        description: '总配置必须等于100%',
        variant: 'destructive'
      });
      return;
    }
    
    // 模拟市场表现（3年）
    const years = 3;
    let portfolioValue = 100000;
    const yearlyReturns: number[] = [];
    
    for (let year = 0; year < years; year++) {
      let yearReturn = 0;
      
      assetClasses.forEach(asset => {
        const allocation = allocations[asset.id] / 100;
        // 添加随机波动
        const actualReturn = asset.expectedReturn + (Math.random() - 0.5) * asset.risk;
        yearReturn += allocation * actualReturn;
      });
      
      yearlyReturns.push(yearReturn);
      portfolioValue *= (1 + yearReturn / 100);
    }
    
    const totalReturn = portfolioValue - 100000;
    const totalReturnRate = (totalReturn / 100000) * 100;
    const avgAnnualReturn = yearlyReturns.reduce((sum, r) => sum + r, 0) / years;
    
    // 计算风险指标
    const portfolioRisk = assetClasses.reduce((sum, asset) => {
      return sum + (allocations[asset.id] / 100) * asset.risk;
    }, 0);
    
    // 计算多元化程度
    const diversification = Object.values(allocations).filter(v => v > 0).length;
    const maxAllocation = Math.max(...Object.values(allocations));
    
    // 评估配置策略
    let strategy = '';
    if (allocations.stocks > 60) {
      strategy = '激进型';
    } else if (allocations.stocks > 40) {
      strategy = '成长型';
    } else if (allocations.stocks > 20) {
      strategy = '平衡型';
    } else {
      strategy = '保守型';
    }
    
    const gameResult = {
      allocations,
      portfolioValue,
      totalReturn,
      totalReturnRate,
      avgAnnualReturn,
      portfolioRisk,
      diversification,
      maxAllocation,
      strategy,
      yearlyReturns
    };
    
    // 保存到 localStorage
    const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
    if (!completedGames.includes('portfolio')) {
      completedGames.push('portfolio');
      localStorage.setItem('completedGames', JSON.stringify(completedGames));
    }
    localStorage.setItem('portfolioResult', JSON.stringify(gameResult));
    
    setGameState('results');
    
    toast({
      title: '配置完成',
      description: `3年后资产: ¥${portfolioValue.toFixed(2)}`,
    });
  };

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  if (showInstructions) {
    return (
      <div className="min-h-screen p-4 xl:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">📊 资产配置游戏</CardTitle>
            <CardDescription>测试您的资产配置和风险管理能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">游戏规则：</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>您有 <strong className="text-primary">¥100,000</strong> 需要配置到不同资产类别</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>四种资产类别：股票、债券、房地产、现金</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>每种资产有不同的预期回报和风险水平</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>总配置必须等于 <strong className="text-primary">100%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">5.</span>
                  <span>系统将模拟 3 年的市场表现，展示您的投资结果</span>
                </li>
              </ul>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>测试目的：</strong>评估您的资产配置策略、风险管理能力和多元化投资意识。
                </p>
              </div>
            </div>

            <Button 
              onClick={startGame} 
              className="w-full btn-glow"
              size="lg"
            >
              开始配置
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'results') {
    const result = JSON.parse(localStorage.getItem('portfolioResult') || '{}');
    
    return (
      <div className="min-h-screen p-4 xl:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/games')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回游戏中心
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">配置结果</CardTitle>
              <CardDescription className="text-center">
                投资策略: <strong>{result.strategy}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">3年后资产</p>
                  <p className="text-2xl font-bold">¥{result.portfolioValue?.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">总收益</p>
                  <p className={`text-2xl font-bold ${result.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.totalReturn >= 0 ? '+' : ''}¥{result.totalReturn?.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">年化收益率</p>
                  <p className={`text-2xl font-bold ${result.avgAnnualReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.avgAnnualReturn >= 0 ? '+' : ''}{result.avgAnnualReturn?.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">您的资产配置</h3>
                {assetClasses.map(asset => (
                  <div key={asset.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{asset.name}</span>
                      <span className="text-primary font-bold">{result.allocations?.[asset.id]}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${asset.color} transition-all duration-500`}
                        style={{ width: `${result.allocations?.[asset.id]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">组合风险</p>
                  <p className="text-xl font-bold">{result.portfolioRisk?.toFixed(2)}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">多元化程度</p>
                  <p className="text-xl font-bold">{result.diversification} / 4 种资产</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">配置评价</h4>
                <p className="text-sm text-muted-foreground">
                  {result.maxAllocation > 70 && '您的配置较为集中，建议增加多元化程度以分散风险。'}
                  {result.maxAllocation <= 70 && result.maxAllocation > 50 && '您的配置相对集中，有一定的多元化。'}
                  {result.maxAllocation <= 50 && '您的配置较为分散，有良好的多元化程度。'}
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => {
                  setGameState('allocating');
                  setAllocations({ stocks: 25, bonds: 25, realestate: 25, cash: 25 });
                }} className="flex-1" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重新配置
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-6 w-6" />
              资产配置
            </CardTitle>
            <CardDescription>
              将 ¥100,000 配置到不同资产类别
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Allocation */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">总配置</p>
              <p className={`text-3xl font-bold ${totalAllocation === 100 ? 'text-green-500' : 'text-red-500'}`}>
                {totalAllocation}%
              </p>
              {totalAllocation !== 100 && (
                <p className="text-xs text-red-500 mt-1">需要等于 100%</p>
              )}
            </div>

            {/* Asset Sliders */}
            <div className="space-y-6">
              {assetClasses.map(asset => (
                <div key={asset.id} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{asset.name}</h3>
                      <p className="text-xs text-muted-foreground">{asset.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        预期回报: {asset.expectedReturn}% | 风险: {asset.risk}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{allocations[asset.id]}%</p>
                      <p className="text-xs text-muted-foreground">
                        ¥{((allocations[asset.id] / 100) * 100000).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <Slider
                    value={[allocations[asset.id]]}
                    onValueChange={(value) => handleAllocationChange(asset.id, value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <Button 
              onClick={submitAllocation}
              className="w-full btn-glow"
              size="lg"
              disabled={totalAllocation !== 100}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              提交配置并查看结果
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioAllocationGamePage;
