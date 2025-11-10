import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  KeyRound, 
  User, 
  Database,
  Shield,
  TestTube2,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemTestGuidePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedSteps, setCopiedSteps] = useState<string[]>([]);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSteps([...copiedSteps, stepId]);
    toast({
      title: '已复制',
      description: '内容已复制到剪贴板'
    });
    setTimeout(() => {
      setCopiedSteps(copiedSteps.filter(id => id !== stepId));
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TestTube2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold gradient-text">系统测试指南</h1>
            </div>
            <p className="text-muted-foreground">
              了解如何测试登录认证系统和其他核心功能
            </p>
          </div>
        </div>

        {/* System Status */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>当前系统状态：演示模式</AlertTitle>
          <AlertDescription>
            系统当前运行在演示模式下，验证码会直接显示在界面上，无需真实邮件服务。
          </AlertDescription>
        </Alert>

        {/* Test Tabs */}
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth">登录认证</TabsTrigger>
            <TabsTrigger value="database">数据库</TabsTrigger>
            <TabsTrigger value="features">功能测试</TabsTrigger>
            <TabsTrigger value="troubleshoot">故障排查</TabsTrigger>
          </TabsList>

          {/* Authentication Testing */}
          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  登录认证系统测试
                </CardTitle>
                <CardDescription>
                  验证邮箱验证码登录功能是否正常工作
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">测试步骤</h3>
                  
                  {/* Step 1 */}
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        访问登录页面
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        点击页面右上角的"登录"按钮，或直接访问登录页面
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/login')}
                      >
                        前往登录页面
                      </Button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        输入测试邮箱
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        输入任意有效格式的邮箱地址（演示模式下不需要真实邮箱）
                      </p>
                      <div className="flex gap-2 items-center">
                        <code className="px-3 py-1 bg-muted rounded text-sm">
                          test@example.com
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('test@example.com', 'email')}
                        >
                          {copiedSteps.includes('email') ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        获取验证码
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        点击"发送验证码"按钮，系统会在弹出的提示框中显示6位数字验证码
                      </p>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>重要：</strong>验证码会直接显示在成功提示框中，格式为"验证码已发送到 xxx（演示模式：123456）"
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        输入验证码
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        将提示框中显示的6位验证码输入到验证码输入框中
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        5
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        验证登录
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        点击"验证并登录"按钮，如果验证码正确且未过期（5分钟内），将成功登录
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected Results */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">预期结果</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">验证码发送后，页面显示倒计时（60秒）</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">输入正确验证码后，成功跳转到首页</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">页面右上角显示用户邮箱和退出按钮</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">可以访问需要登录的功能（测试历史、游戏等）</span>
                    </div>
                  </div>
                </div>

                {/* Common Issues */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">常见问题</h3>
                  <div className="space-y-3">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>验证码错误</AlertTitle>
                      <AlertDescription>
                        确保输入的是提示框中显示的6位数字，验证码有效期为5分钟
                      </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>验证码已过期</AlertTitle>
                      <AlertDescription>
                        如果超过5分钟，需要重新发送验证码
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Testing */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  数据库连接测试
                </CardTitle>
                <CardDescription>
                  验证Supabase数据库是否正常工作
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">测试方法</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 border rounded">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">用户数据存储</p>
                        <p className="text-sm text-muted-foreground">
                          登录后，用户信息会自动保存到数据库的 users 表中
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 border rounded">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">验证码记录</p>
                        <p className="text-sm text-muted-foreground">
                          每次发送验证码都会在 verification_codes 表中创建记录
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 border rounded">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">测试结果保存</p>
                        <p className="text-sm text-muted-foreground">
                          完成测试后，结果会保存到 test_results 表中，可在测试历史页面查看
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 border rounded">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">游戏历史记录</p>
                        <p className="text-sm text-muted-foreground">
                          游戏结果保存在浏览器本地存储中，可在游戏历史页面查看和清除
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>数据库状态检查</AlertTitle>
                  <AlertDescription>
                    如果登录或保存数据时出现错误，请检查浏览器控制台（F12）查看详细错误信息
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Testing */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube2 className="h-5 w-5 text-primary" />
                  功能测试清单
                </CardTitle>
                <CardDescription>
                  完整的系统功能测试流程
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">1. 测试系统</h3>
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">人格测试</Badge>
                        <span className="text-sm text-muted-foreground">完成Big Five人格问卷</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">数学金融测试</Badge>
                        <span className="text-sm text-muted-foreground">回答金融数学题目</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">风险偏好测试</Badge>
                        <span className="text-sm text-muted-foreground">评估风险容忍度</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">交易特质测试</Badge>
                        <span className="text-sm text-muted-foreground">快速评估交易风格</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">2. 游戏系统</h3>
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">快速反应游戏</Badge>
                        <span className="text-sm text-muted-foreground">测试决策速度</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">两扇门游戏</Badge>
                        <span className="text-sm text-muted-foreground">风险决策测试</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">气球游戏</Badge>
                        <span className="text-sm text-muted-foreground">风险承受能力</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">拍卖游戏</Badge>
                        <span className="text-sm text-muted-foreground">竞价策略测试</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">收获游戏</Badge>
                        <span className="text-sm text-muted-foreground">时机把握能力</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">羊群游戏</Badge>
                        <span className="text-sm text-muted-foreground">独立思考能力</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">3. 历史记录</h3>
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">测试历史</Badge>
                        <span className="text-sm text-muted-foreground">查看和对比测试结果</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">游戏历史</Badge>
                        <span className="text-sm text-muted-foreground">查看游戏统计数据</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">交易者画像</Badge>
                        <span className="text-sm text-muted-foreground">基于历史数据生成个性化画像</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">4. 数据管理</h3>
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">清除测试历史</Badge>
                        <span className="text-sm text-muted-foreground">删除所有测试记录</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">清除游戏历史</Badge>
                        <span className="text-sm text-muted-foreground">删除所有游戏记录</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">退出登录</Badge>
                        <span className="text-sm text-muted-foreground">清除登录状态</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>测试建议</AlertTitle>
                  <AlertDescription>
                    建议按照上述顺序依次测试各项功能，确保每个模块都能正常工作
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshoot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  故障排查指南
                </CardTitle>
                <CardDescription>
                  常见问题的解决方案
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>问题：无法发送验证码</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>可能原因：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>邮箱格式不正确</li>
                        <li>数据库连接失败</li>
                        <li>网络连接问题</li>
                      </ul>
                      <p className="mt-2">解决方案：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>检查邮箱格式是否正确</li>
                        <li>打开浏览器控制台（F12）查看错误信息</li>
                        <li>刷新页面重试</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>问题：验证码验证失败</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>可能原因：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>验证码输入错误</li>
                        <li>验证码已过期（超过5分钟）</li>
                        <li>验证码已被使用</li>
                      </ul>
                      <p className="mt-2">解决方案：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>仔细核对提示框中显示的验证码</li>
                        <li>如果超时，重新发送验证码</li>
                        <li>确保使用最新发送的验证码</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>问题：登录后立即退出</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>可能原因：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>浏览器不支持localStorage</li>
                        <li>隐私模式限制</li>
                      </ul>
                      <p className="mt-2">解决方案：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>使用普通浏览模式（非隐私/无痕模式）</li>
                        <li>允许网站使用Cookie和本地存储</li>
                        <li>尝试使用其他浏览器</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>问题：测试结果无法保存</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>可能原因：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>未登录状态</li>
                        <li>数据库连接失败</li>
                        <li>网络中断</li>
                      </ul>
                      <p className="mt-2">解决方案：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>确保已登录</li>
                        <li>检查网络连接</li>
                        <li>查看浏览器控制台错误信息</li>
                        <li>重新完成测试</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>获取技术支持</AlertTitle>
                    <AlertDescription>
                      如果问题仍未解决，请打开浏览器控制台（按F12），切换到Console标签，截图错误信息以便进一步诊断。
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用测试功能快速入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/login')}
              >
                <User className="mr-2 h-4 w-4" />
                测试登录
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/test/mode-selection')}
              >
                <TestTube2 className="mr-2 h-4 w-4" />
                开始测试
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/games')}
              >
                <TestTube2 className="mr-2 h-4 w-4" />
                玩游戏
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemTestGuidePage;
