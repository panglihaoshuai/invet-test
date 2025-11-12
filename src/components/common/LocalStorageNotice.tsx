import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, Download, Upload, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { storageUtils } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

interface LocalStorageNoticeProps {
  variant?: 'inline' | 'dialog';
  showActions?: boolean;
}

const LocalStorageNotice = ({ variant = 'inline', showActions = true }: LocalStorageNoticeProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [storageUsage, setStorageUsage] = useState(storageUtils.getStorageUsage());

  const handleExport = () => {
    try {
      const data = storageUtils.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `投资测评数据备份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: '导出成功',
        description: '您的数据已成功导出，请妥善保管备份文件'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '导出数据时出现错误',
        variant: 'destructive'
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            storageUtils.importAllData(data);
            setStorageUsage(storageUtils.getStorageUsage());
            
            toast({
              title: '导入成功',
              description: '您的数据已成功恢复'
            });
            
            // 刷新页面以加载新数据
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            toast({
              title: '导入失败',
              description: error instanceof Error ? error.message : '导入数据时出现错误',
              variant: 'destructive'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有本地数据吗？此操作不可恢复！建议先导出备份。')) {
      storageUtils.clearAllAppData();
      setStorageUsage(storageUtils.getStorageUsage());
      
      toast({
        title: '数据已清空',
        description: '所有本地数据已被清除'
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const content = (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>本地存储说明</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            您的<strong>测试结果</strong>和<strong>游戏历史记录</strong>都保存在本地浏览器中，
            不会上传到服务器。这样可以保护您的隐私，但也意味着：
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>清除浏览器数据会导致所有记录丢失</li>
            <li>更换设备或浏览器无法查看之前的记录</li>
            <li>建议定期导出备份您的数据</li>
          </ul>
        </AlertDescription>
      </Alert>

      {storageUsage.percentage > 70 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>存储空间警告</AlertTitle>
          <AlertDescription>
            本地存储空间已使用 {storageUsage.percentage.toFixed(1)}%，
            建议导出备份后清理部分数据。
          </AlertDescription>
        </Alert>
      )}

      {showActions && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出备份
          </Button>
          <Button onClick={handleImport} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            导入数据
          </Button>
          <Button onClick={handleClearData} variant="destructive" size="sm">
            清空数据
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>存储使用情况: {(storageUsage.used / 1024).toFixed(2)} KB / {(storageUsage.total / 1024).toFixed(2)} KB</p>
        <p className="mt-1">
          注意：只有<strong>用户登录</strong>和<strong>支付验证</strong>功能使用服务器，
          其他所有数据都保存在您的设备上。
        </p>
      </div>
    </div>
  );

  if (variant === 'dialog') {
    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="ghost" size="sm">
          <Info className="mr-2 h-4 w-4" />
          数据存储说明
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>数据存储与隐私保护</DialogTitle>
              <DialogDescription>
                了解您的数据如何存储和管理
              </DialogDescription>
            </DialogHeader>
            {content}
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>
                我知道了
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return content;
};

export default LocalStorageNotice;
