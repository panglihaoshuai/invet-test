import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, AlertCircle, BookOpen } from 'lucide-react';

interface InvestmentRecommendationProps {
  investmentStyle: string;
}

const InvestmentRecommendation = ({ investmentStyle }: InvestmentRecommendationProps) => {
  const getRecommendations = (style: string) => {
    const recommendations: Record<string, {
      description: string;
      strengths: string[];
      risks: string[];
      suggestions: string[];
    }> = {
      '趋势跟踪策略': {
        description: '适合捕捉市场中长期趋势，通过技术分析识别趋势方向并顺势而为。',
        strengths: [
          '能够捕捉大级别行情，获取可观收益',
          '有明确的交易规则和纪律',
          '适合市场趋势明显的时期'
        ],
        risks: [
          '震荡市场可能频繁止损',
          '需要较强的心理承受能力',
          '可能错过短期机会'
        ],
        suggestions: [
          '建立完善的趋势识别系统',
          '严格执行止损策略',
          '保持耐心，避免频繁交易',
          '关注宏观经济和行业趋势'
        ]
      },
      '波段交易策略': {
        description: '在市场波动中寻找短中期交易机会，平衡风险与收益。',
        strengths: [
          '灵活应对市场变化',
          '可以在震荡市场中获利',
          '风险相对可控'
        ],
        risks: [
          '需要较高的市场敏感度',
          '交易频率较高，成本增加',
          '容易受情绪影响'
        ],
        suggestions: [
          '结合技术分析和基本面分析',
          '设置合理的止盈止损点',
          '控制仓位，分散风险',
          '保持交易纪律'
        ]
      },
      '价值投资策略': {
        description: '寻找被低估的优质资产，长期持有等待价值回归。',
        strengths: [
          '长期收益稳定',
          '交易成本低',
          '心理压力相对较小'
        ],
        risks: [
          '需要较长的持有周期',
          '短期可能面临账面亏损',
          '需要深入的基本面研究能力'
        ],
        suggestions: [
          '深入研究公司基本面',
          '关注行业发展趋势',
          '保持长期投资视角',
          '定期审视投资组合'
        ]
      },
      '量化交易策略': {
        description: '利用数学模型和算法进行系统化交易，追求稳定收益。',
        strengths: [
          '消除情绪干扰',
          '可以处理大量数据',
          '执行效率高'
        ],
        risks: [
          '需要较强的数学和编程能力',
          '模型可能失效',
          '过度拟合风险'
        ],
        suggestions: [
          '持续优化交易模型',
          '进行充分的回测验证',
          '监控模型表现',
          '保持模型的适应性'
        ]
      },
      '稳健配置策略': {
        description: '通过资产配置和风险管理，追求稳定的长期回报。',
        strengths: [
          '风险分散，波动较小',
          '适合长期财富积累',
          '心理压力小'
        ],
        risks: [
          '收益率可能较低',
          '需要定期再平衡',
          '可能错过高收益机会'
        ],
        suggestions: [
          '建立合理的资产配置比例',
          '定期审视和调整组合',
          '关注宏观经济环境',
          '保持投资纪律'
        ]
      },
      '灵活交易策略': {
        description: '根据市场环境灵活调整策略，追求多样化的交易机会。',
        strengths: [
          '适应性强',
          '可以把握多种机会',
          '风险分散'
        ],
        risks: [
          '需要较高的市场理解力',
          '策略切换可能不及时',
          '容易分散精力'
        ],
        suggestions: [
          '建立多种策略体系',
          '明确不同策略的适用条件',
          '保持学习和适应能力',
          '控制整体风险敞口'
        ]
      }
    };

    return recommendations[style] || recommendations['稳健配置策略'];
  };

  const recommendation = getRecommendations(investmentStyle);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            策略描述
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{recommendation.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            策略优势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            潜在风险
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">!</span>
                <span className="text-sm">{risk}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            实施建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentRecommendation;
