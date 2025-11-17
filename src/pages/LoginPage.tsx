import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/db/adminApi';
import { Loader2, Mail, KeyRound } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [usePassword, setUsePassword] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();
  const { sendVerificationCode, verifyCodeAndLogin, registerPassword, loginPassword } = useAuth();
  const navigate = useNavigate();

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入有效的邮箱地址',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);

    try {
      await sendVerificationCode(email);

      toast({
        title: '验证码已发送',
        description: `验证码已发送到 ${email}，请查收邮件`,
      });

      setIsCodeSent(true);
      setCountdown(60);

      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Send code error:', error);
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败，请稍后重试';
      toast({
        title: '发送失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRegister = async () => {
    if (!validateEmail(email) || code.length < 6) return;
    setIsSending(true);
    try {
      await registerPassword(email, code);
      try {
        await navigator.clipboard.writeText(`邮箱：${email}\n密码：${code}`);
        toast({ title: '已复制到粘贴板', description: '账号与密码已复制，请妥善保存' });
      } catch {}
      setIsRegister(false);
      toast({ title: '注册成功', description: '请妥善保存密码，系统不提供找回；请使用账号密码登录' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '注册失败';
      toast({ title: '注册失败', description: msg, variant: 'destructive' });
    } finally { setIsSending(false); }
  };

  const handleLoginPassword = async () => {
    if (!validateEmail(email) || code.length < 6) return;
    setIsVerifying(true);
    try {
      await loginPassword(email, code);
      const isAdmin = await adminApi.isAdmin();
      toast({ title: '登录成功', description: isAdmin ? '欢迎管理员！' : '欢迎使用人格特质投资策略评估系统' });
      navigate(isAdmin ? '/admin' : '/');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '登录失败';
      toast({ title: '登录失败', description: msg, variant: 'destructive' });
    } finally { setIsVerifying(false); }
  };

  // 验证登录
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: '验证码错误',
        description: '请输入完整的6位验证码',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      await verifyCodeAndLogin(email, code);
      
      // 检查是否为管理员
      const isAdmin = await adminApi.isAdmin();
      
      toast({
        title: '登录成功',
        description: isAdmin ? '欢迎管理员！' : '欢迎使用人格特质投资策略评估系统',
      });
      
      // 管理员跳转到管理后台，普通用户跳转到首页
      navigate(isAdmin ? '/admin' : '/');
    } catch (error) {
      console.error('Verify code error:', error);
      const errorMessage = error instanceof Error ? error.message : '验证码错误或已过期';
      toast({
        title: '验证失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            <span className="gradient-text">人格特质投资策略评估系统</span>
          </CardTitle>
          <CardDescription className="text-center">
            使用账号密码登录，开始您的投资性格评估
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={false}
                className="pl-10"
              />
            </div>
          </div>

          {
            <>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  {isRegister ? '设置密码' : '密码'}
                </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isRegister ? '至少6位' : '请输入密码'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isRegister && (
                <p className="text-xs text-muted-foreground">请妥善保存密码，系统暂不提供找回功能</p>
              )}
            </div>

              <div className="flex gap-2">
                {isRegister ? (
                  <Button onClick={handleRegister} disabled={isSending || !email || code.length < 6} className="flex-1 btn-glow">
                    {isSending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 注册中...</>) : ('注册')}
                  </Button>
                ) : (
                  <Button onClick={handleLoginPassword} disabled={isVerifying || !email || code.length < 6} className="flex-1 btn-glow">
                    {isVerifying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 登录中...</>) : ('登录')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                </Button>
              </div>
            </>
          }

          

          
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
