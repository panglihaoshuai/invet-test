import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deepseekAnalysisStorage } from '@/utils/localStorage';
import { Sparkles, Download, HardDrive } from 'lucide-react';
import type { DeepSeekAnalysis } from '@/types/types';
import { useT } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeepSeekAnalysisCardProps {
  analysis: DeepSeekAnalysis;
}

const DeepSeekAnalysisCard = ({ analysis }: DeepSeekAnalysisCardProps) => {
  const t = useT()
  const { language } = useLanguage()
  const locale = language === 'zh' ? 'zh-CN' : 'en-US'
  const paragraphs = analysis.analysis_content.split('\n\n').filter(p => p.trim());

  const handleSaveLocal = () => {
    try {
      deepseekAnalysisStorage.saveAnalysis(analysis);
      alert(language === 'zh' ? '已保存到本地浏览器' : 'Saved to local browser');
    } catch (e) {
      console.error(e);
      alert(language === 'zh' ? '保存失败：请检查浏览器存储空间' : 'Save failed: check browser storage');
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
            <CardTitle>{t('deepseekTitle')}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSaveLocal}>
              <HardDrive className="h-4 w-4 mr-1" /> {t('saveLocal')}
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> {t('downloadJSON')}
            </Button>
            <Badge variant="secondary">{t('deepDiveBadge')}</Badge>
          </div>
        </div>
        <CardDescription>
          {t('deepseekDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {paragraphs.map((paragraph, index) => {
            // 清理Markdown格式：去除多余的*号、**等
            const cleanParagraph = paragraph
              .replace(/\*\*([^*]+)\*\*/g, '$1') // 去除 **粗体**
              .replace(/\*([^*\n]+)\*/g, '$1') // 去除 *斜体*
              .replace(/\*\s+/g, '') // 去除行首的*号
              .trim();
            
            // 检查是否是标题（以 ### 或 ## 开头）
            if (cleanParagraph.startsWith('###')) {
              const title = cleanParagraph.replace(/^###\s*/, '').trim();
              return (
                <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-primary">
                  {title}
                </h3>
              );
            } else if (cleanParagraph.startsWith('##')) {
              const title = cleanParagraph.replace(/^##\s*/, '').trim();
              return (
                <h2 key={index} className="text-xl font-bold mt-8 mb-4">
                  {title}
                </h2>
              );
            } else if (cleanParagraph.startsWith('- ') || cleanParagraph.startsWith('• ')) {
              // 列表项
              const items = cleanParagraph.split('\n').filter(line => line.startsWith('- ') || line.startsWith('• '));
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                  {items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      {item.replace(/^[-•]\s*/, '').trim()}
                    </li>
                  ))}
                </ul>
              );
            } else if (cleanParagraph.startsWith('1. ') || cleanParagraph.match(/^\d+\.\s/)) {
              // 有序列表
              const items = cleanParagraph.split('\n').filter(line => line.match(/^\d+\.\s/));
              return (
                <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                  {items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      {item.replace(/^\d+\.\s*/, '').trim()}
                    </li>
                  ))}
                </ol>
              );
            } else {
              // 普通段落
              return (
                <p key={index} className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {cleanParagraph}
                </p>
              );
            }
          })}
        </div>

        {/* 分析元数据 */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('generatedAt')}{new Date(analysis.created_at).toLocaleString(locale)}</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t('poweredBy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeepSeekAnalysisCard;
