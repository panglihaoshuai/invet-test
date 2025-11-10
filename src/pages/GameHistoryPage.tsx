import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GameHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameHistory, setGameHistory] = useState<any[]>([]);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = () => {
    const history: any[] = [];
    
    // Load all game results from localStorage
    const gameTypes = [
      { key: 'balloonResults', name: '气球游戏', icon: '🎈' },
      { key: 'harvestResults', name: '等待收获', icon: '🌾' },
      { key: 'auctionResult', name: '拍卖竞价', icon: '🔨' },
      { key: 'twoDoorsResult', name: '双门选择', icon: '🚪' },
      { key: 'herdResult', name: '群体羊群', icon: '👥' },
      { key: 'quickReactionResult', name: '快速反应', icon: '⚡' }
    ];

    gameTypes.forEach(game => {
      const data = localStorage.getItem(game.key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          // Handle both single result and array of results
          if (Array.isArray(parsed)) {
            parsed.forEach((result, index) => {
              history.push({
                ...result,
                gameName: game.name,
                gameIcon: game.icon,
                gameKey: game.key,
                timestamp: result.timestamp || Date.now() - (parsed.length - index) * 86400000
              });
            });
          } else {
            history.push({
              ...parsed,
              gameName: game.name,
              gameIcon: game.icon,
              gameKey: game.key,
              timestamp: parsed.timestamp || Date.now()
            });
          }
        } catch (error) {
          console.error(`Error parsing ${game.key}:`, error);
        }
      }
    });

    // Sort by timestamp (newest first)
    history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    setGameHistory(history);
  };

  const clearAllHistory = () => {
    // Clear all game results
    localStorage.removeItem('balloonResults');
    localStorage.removeItem('harvestResults');
    localStorage.removeItem('auctionResult');
    localStorage.removeItem('twoDoorsResult');
    localStorage.removeItem('herdResult');
    localStorage.removeItem('quickReactionResult');
    localStorage.removeItem('completedGames');
    
    setGameHistory([]);
    
    toast({
      title: '历史已清空',
      description: '所有游戏历史记录已删除',
    });
  };

  const getGameSummary = (game: any) => {
    // Generate summary based on game type
    if (game.gameName === '气球游戏') {
      return `总金币: ${game.totalCoins || 0} | 风险分数: ${game.riskScore?.toFixed(0) || 0}`;
    } else if (game.gameName === '等待收获') {
      return `收益率: ${game.profitRate?.toFixed(1) || 0}% | 耐心: ${game.patienceScore?.toFixed(0) || 0}分`;
    } else if (game.gameName === '拍卖竞价') {
      return `盈亏: ${game.totalProfit >= 0 ? '+' : ''}${game.totalProfit?.toFixed(0) || 0} | 贪婪: ${game.greedScore?.toFixed(0) || 0}分`;
    } else if (game.gameName === '双门选择') {
      return `总金币: ${game.totalCoins || 0} | 风险容忍: ${game.riskTolerance?.toFixed(0) || 0}%`;
    } else if (game.gameName === '群体羊群') {
      return `盈亏: ${game.totalProfit >= 0 ? '+' : ''}${game.totalProfit?.toFixed(0) || 0} | 从众: ${game.herdScore?.toFixed(0) || 0}%`;
    } else if (game.gameName === '快速反应') {
      return `金币: ${game.coins || 0} | 准确率: ${game.accuracy?.toFixed(0) || 0}%`;
    }
    return '';
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/games')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回游戏中心
          </Button>
          
          {gameHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  清空历史
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清空历史？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除所有游戏历史记录，且无法恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllHistory}>
                    确认清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl xl:text-4xl font-bold gradient-text">
            🎮 游戏历史
          </h1>
          <p className="text-muted-foreground">
            查看您的游戏记录和表现
          </p>
        </div>

        {/* Stats Summary */}
        {gameHistory.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{gameHistory.length}</p>
                  <p className="text-sm text-muted-foreground">游戏记录</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {new Set(gameHistory.map(g => g.gameName)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">游戏类型</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {gameHistory.filter(g => 
                      (g.totalProfit && g.totalProfit > 0) || 
                      (g.totalCoins && g.totalCoins > 0) ||
                      (g.coins && g.coins > 0)
                    ).length}
                  </p>
                  <p className="text-sm text-muted-foreground">盈利次数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game History List */}
        {gameHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">暂无游戏记录</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    开始玩游戏后，您的记录将显示在这里
                  </p>
                  <Button onClick={() => navigate('/games')} className="btn-glow">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    开始游戏
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {gameHistory.map((game, index) => (
              <Card key={index} className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{game.gameIcon}</span>
                      <span>{game.gameName}</span>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(game.timestamp).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <CardDescription>
                    {getGameSummary(game)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {game.gameName === '气球游戏' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">总金币</p>
                          <p className="font-bold text-lg">{game.totalCoins}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">完成轮数</p>
                          <p className="font-bold text-lg">{game.roundsCompleted}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">爆炸次数</p>
                          <p className="font-bold text-lg">{game.explosions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">风险分数</p>
                          <p className="font-bold text-lg">{game.riskScore?.toFixed(0)}</p>
                        </div>
                      </>
                    )}
                    {game.gameName === '等待收获' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">最终价值</p>
                          <p className="font-bold text-lg">¥{game.finalValue?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">收益率</p>
                          <p className={`font-bold text-lg ${game.profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {game.profitRate >= 0 ? '+' : ''}{game.profitRate?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">耐心分数</p>
                          <p className="font-bold text-lg">{game.patienceScore?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">冒险分数</p>
                          <p className="font-bold text-lg">{game.riskScore?.toFixed(0)}</p>
                        </div>
                      </>
                    )}
                    {game.gameName === '拍卖竞价' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">最终资金</p>
                          <p className="font-bold text-lg">¥{game.finalCash?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">总盈亏</p>
                          <p className={`font-bold text-lg ${game.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {game.totalProfit >= 0 ? '+' : ''}¥{game.totalProfit?.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">贪婪分数</p>
                          <p className="font-bold text-lg">{game.greedScore?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">锚定偏差</p>
                          <p className="font-bold text-lg">{game.anchorBiasScore?.toFixed(0)}</p>
                        </div>
                      </>
                    )}
                    {game.gameName === '双门选择' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">总金币</p>
                          <p className={`font-bold text-lg ${game.totalCoins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {game.totalCoins >= 0 ? '+' : ''}{game.totalCoins}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">风险容忍</p>
                          <p className="font-bold text-lg">{game.riskTolerance?.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">现状偏差</p>
                          <p className="font-bold text-lg">{game.statusQuoBias?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">切换次数</p>
                          <p className="font-bold text-lg">{game.switchCount}</p>
                        </div>
                      </>
                    )}
                    {game.gameName === '群体羊群' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">最终资产</p>
                          <p className="font-bold text-lg">¥{game.finalValue?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">总盈亏</p>
                          <p className={`font-bold text-lg ${game.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {game.totalProfit >= 0 ? '+' : ''}¥{game.totalProfit?.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">从众指数</p>
                          <p className="font-bold text-lg">{game.herdScore?.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">独立胜率</p>
                          <p className="font-bold text-lg">{game.independentWinRate?.toFixed(0)}%</p>
                        </div>
                      </>
                    )}
                    {game.gameName === '快速反应' && (
                      <>
                        <div>
                          <p className="text-muted-foreground">总金币</p>
                          <p className={`font-bold text-lg ${game.coins >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {game.coins >= 0 ? '+' : ''}{game.coins}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">准确率</p>
                          <p className="font-bold text-lg">{game.accuracy?.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">速度分数</p>
                          <p className="font-bold text-lg">{game.speedScore?.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">情绪控制</p>
                          <p className="font-bold text-lg">{Math.min(100, game.emotionControl)?.toFixed(0)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;
