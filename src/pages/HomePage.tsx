import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Brain, Calculator, TrendingUp, FileText, LogOut, Play, Shield, History, Gamepad2, TestTube2, Info } from 'lucide-react';
import TraderProfileCard from '@/components/common/TraderProfileCard';
import LocalStorageNotice from '@/components/common/LocalStorageNotice';
import { adminApi } from '@/db/adminApi';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查是否为管理员
  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        console.log('🔍 检查管理员权限...');
        console.log('👤 当前用户:', user);
        console.log('📧 邮箱:', user.email);
        console.log('🎭 角色:', user.role);
        
        const adminStatus = await adminApi.isAdmin();
        console.log('✅ 管理员状态:', adminStatus);
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          console.log('🎉 您是管理员！应该能看到管理员后台按钮。');
        } else {
          console.log('⚠️ 您不是管理员。如果您应该是管理员，请退出登录后重新登录。');
        }
      }
    };
    checkAdmin();
  }, [isAuthenticated, user]);

  // 开始新测试 - 导航到测试模式选择页面
  const handleStartTest = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    navigate('/test/mode-selection');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: '已退出登录',
      description: '感谢使用本系统',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-2">
              人格特质投资策略评估系统
            </h1>
            <p className="text-muted-foreground">
              基于科学的人格测评和金融知识评估，为您推荐最适合的投资策略
            </p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              {isAdmin && (
                <Button variant="default" onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  管理员后台
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/games')}>
                <Gamepad2 className="mr-2 h-4 w-4" />
                游戏中心
              </Button>
              <Button variant="outline" onClick={() => navigate('/test/history')}>
                <History className="mr-2 h-4 w-4" />
                测试历史
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </Button>
            </div>
          )}
        </div>

        {/* Test Mode Alert */}
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>系统演示模式</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/system-test-guide')}
            >
              <TestTube2 className="mr-2 h-4 w-4" />
              查看测试指南
            </Button>
          </AlertTitle>
          <AlertDescription>
            当前系统运行在演示模式下。登录时验证码会直接显示在提示框中，无需真实邮件服务。
            点击右侧按钮查看完整的系统测试指南。
          </AlertDescription>
        </Alert>

        {/* Local Storage Notice */}
        <LocalStorageNotice variant="compact" />

        {/* Main CTA */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">开始您的投资性格评估</CardTitle>
            <CardDescription>
              通过四个维度的专业测评，我们将为您匹配最适合的投资策略
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={isAuthenticated ? handleStartTest : () => navigate('/login')}
              size="lg"
              className="w-full xl:w-auto btn-glow"
            >
              <Play className="mr-2 h-5 w-5" />
              {isAuthenticated ? '开始测试' : '登录后开始'}
            </Button>
          </CardContent>
        </Card>

        {/* Trader Profile */}
        {isAuthenticated && <TraderProfileCard />}

        {/* Features */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>人格特质测试</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                基于Big Five和16Personalities模型，50道题目深度评估您的投资性格特征和行为倾向。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>交易特征评估</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                了解您的交易频率、偏好标的、分析方法和投资理念，精准匹配适合的交易风格。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>数学金融能力</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                通过专业的金融数学题目，评估您对投资产品、风险收益、复利计算等核心概念的理解程度。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>风险偏好评估</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                通过投资场景模拟，评估您的风险承受能力、投资期限偏好和损失厌恶程度，确定您的风险等级。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              评估流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <h3 className="font-semibold">完成测试</h3>
                <p className="text-sm text-muted-foreground">
                  依次完成人格、数学金融和风险偏好三项测试
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <h3 className="font-semibold">智能分析</h3>
                <p className="text-sm text-muted-foreground">
                  系统使用欧几里得距离算法匹配最适合的投资风格
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <h3 className="font-semibold">生成报告</h3>
                <p className="text-sm text-muted-foreground">
                  获得详细的评估报告和个性化投资建议
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                  4
                </div>
                <h3 className="font-semibold">下载保存</h3>
                <p className="text-sm text-muted-foreground">
                  下载PDF报告，随时查看您的投资策略建议
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>本系统仅供参考，不构成投资建议。投资有风险，决策需谨慎。</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
