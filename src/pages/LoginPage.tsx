import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { userApi } from '@/db/api';
import { adminApi } from '@/db/adminApi';
import { Loader2, Mail, KeyRound } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const { setUser } = useAuth();
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
      // 使用 Supabase Auth 发送 OTP（数字验证码）
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // 不使用魔法链接
        }
      });

      if (error) {
        throw error;
      }

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

  // 验证登录
  const handleVerifyCode = async () => {
    if (code.length < 6 || code.length > 8) {
      toast({
        title: '验证码错误',
        description: '请输入完整的验证码（6-8位数字）',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      // 使用 Supabase Auth 验证 OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email'
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error('验证码错误或已过期，请重新获取验证码');
      }

      if (!data.user) {
        throw new Error('验证失败：未能获取用户信息');
      }

      // 创建或获取用户资料
      console.log('Creating/fetching user profile for:', email);
      const user = await userApi.upsertUser(email);

      if (!user) {
        console.error('Failed to create/fetch user profile');
        throw new Error('用户创建失败：无法在数据库中创建用户记录，请联系管理员');
      }

      console.log('User profile created/fetched successfully:', user);
      setUser(user);
      
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
            使用邮箱验证码登录，开始您的投资性格评估
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
                disabled={isCodeSent}
                className="pl-10"
              />
            </div>
          </div>

          {!isCodeSent ? (
            <Button
              onClick={handleSendCode}
              disabled={isSending || !email}
              className="w-full btn-glow"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                '发送验证码'
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  验证码
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || code.length < 6}
                  className="flex-1 btn-glow"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    '验证登录'
                  )}
                </Button>
                <Button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSending}
                  variant="outline"
                >
                  {countdown > 0 ? `${countdown}秒` : '重新发送'}
                </Button>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground text-center mt-4">
            <p>验证码有效期为5分钟，请及时输入</p>
            <p className="mt-2 text-amber-600">
              ⚠️ 注意：Supabase 默认邮件服务每小时限制3封邮件
            </p>
            <p className="mt-1 text-muted-foreground">
              建议配置自定义 SMTP 服务以解除限制
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
