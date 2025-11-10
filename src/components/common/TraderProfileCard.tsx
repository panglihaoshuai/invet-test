import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { generateTraderProfile, hasEnoughDataForProfile } from '@/utils/traderProfile';
import { TrendingUp, AlertCircle } from 'lucide-react';

const TraderProfileCard = () => {
  if (!hasEnoughDataForProfile()) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">暂无交易者画像</h3>
              <p className="text-sm text-muted-foreground">
                完成测试或游戏后，系统将为您生成个性化的交易者画像
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profile = generateTraderProfile();

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中等风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };

  const getEmotionalControlText = (control: string) => {
    switch (control) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      default: return '未知';
    }
  };

  const getDecisionSpeedText = (speed: string) => {
    switch (speed) {
      case 'very-fast': return '极快';
      case 'fast': return '快速';
      case 'moderate': return '适中';
      case 'slow': return '较慢';
      default: return '未知';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-3xl">{profile.profileIcon}</span>
          <span>{profile.profileType}</span>
        </CardTitle>
        <CardDescription>{profile.profileDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">风险等级</p>
            <p className={`font-bold ${getRiskLevelColor(profile.riskLevel)}`}>
              {getRiskLevelText(profile.riskLevel)}
            </p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">交易风格</p>
            <p className="font-bold text-primary">{profile.tradingStyle}</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">情绪控制</p>
            <p className="font-bold">{getEmotionalControlText(profile.emotionalControl)}</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">决策速度</p>
            <p className="font-bold">{getDecisionSpeedText(profile.decisionSpeed)}</p>
          </div>
        </div>

        {/* 能力雷达 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">能力评估</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">风险承受</span>
                <span className="font-medium">{profile.scores.riskTolerance.toFixed(0)}</span>
              </div>
              <Progress value={profile.scores.riskTolerance} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">耐心指数</span>
                <span className="font-medium">{profile.scores.patience.toFixed(0)}</span>
              </div>
              <Progress value={profile.scores.patience} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">情绪稳定</span>
                <span className="font-medium">{profile.scores.emotionalStability.toFixed(0)}</span>
              </div>
              <Progress value={profile.scores.emotionalStability} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">独立思考</span>
                <span className="font-medium">{profile.scores.independence.toFixed(0)}</span>
              </div>
              <Progress value={profile.scores.independence} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">纪律性</span>
                <span className="font-medium">{profile.scores.discipline.toFixed(0)}</span>
              </div>
              <Progress value={profile.scores.discipline} className="h-2" />
            </div>
          </div>
        </div>

        {/* 优势 */}
        {profile.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              优势
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 劣势 */}
        {profile.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              待提升
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.weaknesses.map((weakness, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 建议 */}
        {profile.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">💡 个性化建议</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {profile.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TraderProfileCard;
