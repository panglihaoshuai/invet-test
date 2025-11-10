import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, verificationApi } from '@/db/api';
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
      // 生成6位随机验证码
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 保存验证码到数据库
      const result = await verificationApi.createVerificationCode(email, verificationCode);

      if (result) {
        // 在实际应用中，这里应该调用邮件发送服务
        // 为了演示，我们直接显示验证码
        console.log('验证码:', verificationCode);
        
        toast({
          title: '验证码已发送',
          description: `验证码已发送到 ${email}（演示模式：${verificationCode}）`,
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
      } else {
        throw new Error('发送验证码失败');
      }
    } catch (error) {
      console.error('Send code error:', error);
      toast({
        title: '发送失败',
        description: '验证码发送失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  // 验证登录
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: '验证码错误',
        description: '请输入6位数字验证码',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      // 验证验证码
      const isValid = await verificationApi.verifyCode(email, code);

      if (isValid) {
        // 创建或获取用户
        const user = await userApi.upsertUser(email);

        if (user) {
          setUser(user);
          toast({
            title: '登录成功',
            description: '欢迎使用人格特质投资策略评估系统',
          });
          navigate('/');
        } else {
          throw new Error('用户创建失败');
        }
      } else {
        toast({
          title: '验证失败',
          description: '验证码错误或已过期，请重新获取',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Verify code error:', error);
      toast({
        title: '验证失败',
        description: '登录失败，请稍后重试',
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
                    placeholder="请输入6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || code.length !== 6}
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
            验证码有效期为5分钟，请及时输入
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
