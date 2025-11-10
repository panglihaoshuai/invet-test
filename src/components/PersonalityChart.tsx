import type { PersonalityScores } from '@/types/types';

interface PersonalityChartProps {
  scores: PersonalityScores;
}

const PersonalityChart = ({ scores }: PersonalityChartProps) => {
  const traits = [
    { key: 'openness', label: '开放性', value: scores.openness },
    { key: 'conscientiousness', label: '尽责性', value: scores.conscientiousness },
    { key: 'extraversion', label: '外向性', value: scores.extraversion },
    { key: 'agreeableness', label: '宜人性', value: scores.agreeableness },
    { key: 'neuroticism', label: '神经质', value: scores.neuroticism }
  ];

  return (
    <div className="space-y-4">
      {traits.map((trait) => (
        <div key={trait.key} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{trait.label}</span>
            <span className="text-sm text-muted-foreground">{trait.value.toFixed(1)}/5.0</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(trait.value / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalityChart;
