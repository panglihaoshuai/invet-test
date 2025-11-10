import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Gamepad2, 
  TrendingUp, 
  PieChart, 
  AlertTriangle, 
  Timer,
  ChevronLeft,
  Play,
  CheckCircle2,
  History
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  duration: string;
  testAspect: string;
  path: string;
}

const GamesHubPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: '请先登录',
        description: '需要登录后才能玩游戏',
        variant: 'destructive'
      });
      navigate('/login');
    }

    // 从 localStorage 读取已完成的游戏
    const completed = localStorage.getItem('completedGames');
    if (completed) {
      try {
        setCompletedGames(JSON.parse(completed));
      } catch (error) {
        console.error('Error parsing completed games:', error);
      }
    }
  }, [isAuthenticated, navigate, toast]);

  const games: GameInfo[] = [
    {
      id: 'balloon',
      title: '🎈 气球游戏',
      description: '测试风险承受能力和收益权衡。每扎一个气球获得10金币，但随时可能爆炸清零。',
      icon: <Gamepad2 className="h-8 w-8" />,
      color: 'text-blue-500',
      duration: '5-10 分钟',
      testAspect: '风险偏好',
      path: '/games/balloon'
    },
    {
      id: 'harvest',
      title: '🌾 等待收获',
      description: '模拟长期投资，种子需要时间成长。测试您的耐心与纪律性，决定何时收获。',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'text-green-500',
      duration: '5-10 分钟',
      testAspect: '耐心与纪律性',
      path: '/games/harvest'
    },
    {
      id: 'auction',
      title: '🔨 拍卖竞价',
      description: '参与虚拟拍卖竞拍资产。测试您的贪婪程度与锚定偏差，避免追高陷阱。',
      icon: <PieChart className="h-8 w-8" />,
      color: 'text-purple-500',
      duration: '5-8 分钟',
      testAspect: '贪婪与锚定偏差',
      path: '/games/auction'
    },
    {
      id: 'two-doors',
      title: '🚪 双门选择',
      description: '在稳定收益和高风险高回报之间选择。测试您的损失厌恶与决策偏差。',
      icon: <AlertTriangle className="h-8 w-8" />,
      color: 'text-red-500',
      duration: '3-5 分钟',
      testAspect: '损失厌恶',
      path: '/games/two-doors'
    },
    {
      id: 'herd',
      title: '👥 群体羊群',
      description: '在虚拟市场中决定买卖，观察其他交易者行为。测试您的从众心理与独立思考。',
      icon: <Timer className="h-8 w-8" />,
      color: 'text-orange-500',
      duration: '5-8 分钟',
      testAspect: '从众心理',
      path: '/games/herd'
    },
    {
      id: 'quick-reaction',
      title: '⚡ 快速反应',
      description: '模拟日内交易，限时决策买卖。测试您的决策速度与情绪控制能力。',
      icon: <Timer className="h-8 w-8" />,
      color: 'text-yellow-500',
      duration: '5-8 分钟',
      testAspect: '决策速度与情绪控制',
      path: '/games/quick-reaction'
    }
  ];

  const handlePlayGame = (game: GameInfo) => {
    navigate(game.path);
  };

  const isGameCompleted = (gameId: string) => {
    return completedGames.includes(gameId);
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button variant="outline" onClick={() => navigate('/games/history')}>
              <History className="mr-2 h-4 w-4" />
              游戏历史
            </Button>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl xl:text-4xl font-bold gradient-text">
              🎮 投资心理游戏中心
            </h1>
            <p className="text-muted-foreground">
              通过趣味游戏，深入了解您的投资心理和决策模式
            </p>
          </div>
        </div>

        {/* Stats */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{games.length}</p>
                <p className="text-sm text-muted-foreground">可玩游戏</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{completedGames.length}</p>
                <p className="text-sm text-muted-foreground">已完成</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  {Math.round((completedGames.length / games.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">完成度</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="border-primary/20 hover:border-primary/40 transition-all relative overflow-hidden"
            >
              {isGameCompleted(game.id) && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    已完成
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`${game.color} flex-shrink-0`}>
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{game.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {game.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Timer className="h-3 w-3 mr-1" />
                    {game.duration}
                  </Badge>
                  <Badge variant="outline">
                    测试: {game.testAspect}
                  </Badge>
                </div>

                <Button 
                  onClick={() => handlePlayGame(game)}
                  className="w-full btn-glow"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isGameCompleted(game.id) ? '再玩一次' : '开始游戏'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>💡 游戏说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • <strong>独立游戏：</strong>每个游戏都可以单独进行，无需完成其他测试
            </p>
            <p>
              • <strong>数据收集：</strong>游戏会记录您的决策行为，用于生成更准确的投资建议
            </p>
            <p>
              • <strong>可重复玩：</strong>您可以多次游玩同一个游戏，系统会保存最新的结果
            </p>
            <p>
              • <strong>完整测试：</strong>如果您选择"完整测试"模式，会自动包含这些游戏
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamesHubPage;
