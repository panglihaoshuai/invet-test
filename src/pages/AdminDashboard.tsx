import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, testSubmissionApi } from '@/db/adminApi';
import GiftCodeManager from '@/components/admin/GiftCodeManager';
import type { AdminStatistics, TestSubmission, AdminLog, Profile } from '@/types/types';
import {
  BarChart3,
  Users,
  CreditCard,
  DollarSign,
  MapPin,
  Shield,
  Activity,
  Settings,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gift
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [testSubmissions, setTestSubmissions] = useState<TestSubmission[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAndLoadData();
    }
  }, [user]);

  const checkAdminAndLoadData = async () => {
    setLoading(true);
    try {
      // 直接从 AuthContext 的 user 对象检查角色
      console.log('🔍 AdminDashboard: 检查管理员权限...');
      console.log('👤 AdminDashboard: 当前用户:', user);
      console.log('🎭 AdminDashboard: 用户角色:', user?.role);
      
      const adminStatus = user?.role === 'admin';
      console.log('✅ AdminDashboard: 管理员状态:', adminStatus);
      
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        console.log('❌ AdminDashboard: 权限不足，重定向到首页');
        toast({
          title: '权限不足',
          description: '您没有访问管理员后台的权限',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      console.log('✅ AdminDashboard: 权限验证通过，开始加载数据');
      // 加载数据
      await Promise.all([
        loadStatistics(),
        loadTestSubmissions(),
        loadAdminLogs(),
        loadProfiles(),
        loadPaymentStatus()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: '加载失败',
        description: '无法加载管理员数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    const stats = await adminApi.getStatistics();
    setStatistics(stats);
  };

  const loadTestSubmissions = async () => {
    const submissions = await adminApi.getTestSubmissions(50);
    setTestSubmissions(submissions);
  };

  const loadAdminLogs = async () => {
    const logs = await adminApi.getAdminLogs(50);
    setAdminLogs(logs);
  };

  const loadProfiles = async () => {
    const allProfiles = await adminApi.getAllProfiles(50);
    setProfiles(allProfiles);
  };

  const loadPaymentStatus = async () => {
    const status = await adminApi.getPaymentSystemStatus();
    setPaymentEnabled(status);
  };

  const handleTogglePayment = async (enabled: boolean) => {
    setToggling(true);
    try {
      const success = await adminApi.togglePaymentSystem(enabled);
      if (success) {
        setPaymentEnabled(enabled);
        toast({
          title: '设置成功',
          description: `支付系统已${enabled ? '开启' : '关闭'}`
        });
      } else {
        toast({
          title: '设置失败',
          description: '无法更改支付系统状态',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error toggling payment:', error);
      toast({
        title: '操作失败',
        description: '无法更改支付系统状态',
        variant: 'destructive'
      });
    } finally {
      setToggling(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const success = await adminApi.updateUserRole(userId, role);
      if (success) {
        toast({
          title: '更新成功',
          description: `用户角色已更新为 ${role === 'admin' ? '管理员' : '普通用户'}`
        });
        await loadProfiles();
      } else {
        toast({
          title: '更新失败',
          description: '无法更新用户角色',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: '操作失败',
        description: '无法更新用户角色',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">管理员后台</h1>
              <p className="text-muted-foreground">系统管理和数据统计</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              系统设置
            </Button>
            <Badge variant="default" className="gap-2">
              <Shield className="h-4 w-4" />
              管理员
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">测试总数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.total_tests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                今日: {statistics?.tests_today || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">独立用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.unique_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                已注册用户数量
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">支付订单</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.total_payments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                今日: {statistics?.payments_today || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{((statistics?.total_revenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                已完成订单总额
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              阶梯定价统计
            </CardTitle>
            <CardDescription>用户购买次数分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">首次购买 (¥3.99)</span>
                  <Badge variant="default">{statistics?.first_time_purchases || 0}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  收入: ¥{(((statistics?.first_time_purchases || 0) * 399) / 100).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">第二次购买 (¥2.99)</span>
                  <Badge variant="secondary">{statistics?.second_time_purchases || 0}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  收入: ¥{(((statistics?.second_time_purchases || 0) * 299) / 100).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">老用户优惠 (¥0.99)</span>
                  <Badge variant="outline">{statistics?.repeat_purchases || 0}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  收入: ¥{(((statistics?.repeat_purchases || 0) * 99) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统控制
            </CardTitle>
            <CardDescription>管理系统功能开关</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">支付系统</p>
                <p className="text-sm text-muted-foreground">
                  {paymentEnabled ? '用户可以购买 DeepSeek 分析' : '支付功能已关闭'}
                </p>
              </div>
              <Switch
                checked={paymentEnabled}
                onCheckedChange={handleTogglePayment}
                disabled={toggling}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tests">测试记录</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="giftcodes">礼品码管理</TabsTrigger>
            <TabsTrigger value="logs">审计日志</TabsTrigger>
          </TabsList>

          {/* Test Submissions */}
          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  测试提交记录
                </CardTitle>
                <CardDescription>最近 50 条测试记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSubmissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">暂无测试记录</p>
                  ) : (
                    <div className="space-y-2">
                      {testSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={submission.completed ? 'default' : 'secondary'}>
                                {submission.test_type}
                              </Badge>
                              {submission.completed && (
                                <Badge variant="outline" className="gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  已完成
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {submission.ip_address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {submission.ip_address}
                                </span>
                              )}
                              {submission.country && (
                                <span>{submission.country}</span>
                              )}
                              {submission.city && (
                                <span>{submission.city}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(submission.created_at).toLocaleString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  用户管理
                </CardTitle>
                <CardDescription>管理用户角色和权限</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">暂无用户</p>
                  ) : (
                    <div className="space-y-2">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{profile.email}</p>
                              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                                {profile.role === 'admin' ? '管理员' : '普通用户'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              注册时间: {new Date(profile.created_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          {profile.id !== user?.id && (
                            <div className="flex gap-2">
                              {profile.role === 'user' ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(profile.id, 'admin')}
                                >
                                  设为管理员
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateUserRole(profile.id, 'user')}
                                >
                                  取消管理员
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gift Code Management */}
          <TabsContent value="giftcodes" className="space-y-4">
            <GiftCodeManager />
          </TabsContent>

          {/* Admin Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  审计日志
                </CardTitle>
                <CardDescription>管理员操作记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">暂无操作记录</p>
                  ) : (
                    <div className="space-y-2">
                      {adminLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge>{log.action}</Badge>
                              {log.target_type && (
                                <span className="text-sm text-muted-foreground">
                                  → {log.target_type}
                                </span>
                              )}
                            </div>
                            {log.details && (
                              <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {log.ip_address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {log.ip_address}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(log.created_at).toLocaleString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
