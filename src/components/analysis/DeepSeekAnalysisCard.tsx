import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deepseekAnalysisStorage } from '@/utils/localStorage';
import { Sparkles, Download, HardDrive } from 'lucide-react';
import type { DeepSeekAnalysis } from '@/types/types';

interface DeepSeekAnalysisCardProps {
  analysis: DeepSeekAnalysis;
}

const DeepSeekAnalysisCard = ({ analysis }: DeepSeekAnalysisCardProps) => {
  // 将分析内容按段落分割
  const paragraphs = analysis.analysis_content.split('\n\n').filter(p => p.trim());

  const handleSaveLocal = () => {
    try {
      deepseekAnalysisStorage.saveAnalysis(analysis);
      alert('已保存到本地浏览器');
    } catch (e) {
      console.error(e);
      alert('保存失败：请检查浏览器存储空间');
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(analysis, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek_analysis_${analysis.test_result_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>DeepSeek AI 专业分析</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSaveLocal}>
              <HardDrive className="h-4 w-4 mr-1" /> 保存本地
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> 下载JSON
            </Button>
            <Badge variant="secondary">深度解读</Badge>
          </div>
        </div>
        <CardDescription>
          基于您的测评数据，由 DeepSeek AI 生成的个性化投资心理分析报告
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {paragraphs.map((paragraph, index) => {
            // 检查是否是标题（以 ### 或 ## 开头）
            if (paragraph.startsWith('###')) {
              const title = paragraph.replace(/^###\s*/, '').trim();
              return (
                <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-primary">
                  {title}
                </h3>
              );
            } else if (paragraph.startsWith('##')) {
              const title = paragraph.replace(/^##\s*/, '').trim();
              return (
                <h2 key={index} className="text-xl font-bold mt-8 mb-4">
                  {title}
                </h2>
              );
            } else if (paragraph.startsWith('- ')) {
              // 列表项
              const items = paragraph.split('\n').filter(line => line.startsWith('- '));
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                  {items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      {item.replace(/^-\s*/, '')}
                    </li>
                  ))}
                </ul>
              );
            } else {
              // 普通段落
              return (
                <p key={index} className="text-sm leading-relaxed mb-4">
                  {paragraph}
                </p>
              );
            }
          })}
        </div>

        {/* 分析元数据 */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>生成时间：{new Date(analysis.created_at).toLocaleString('zh-CN')}</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by DeepSeek AI
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeepSeekAnalysisCard;
