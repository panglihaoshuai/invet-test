/**
 * 自动化功能测试脚本
 * Automated Feature Testing Script
 * 
 * 测试所有核心功能并生成测试报告
 * Tests all core features and generates a test report
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('请确保 .env 文件中配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  const result = `${status} ${name}${message ? ': ' + message : ''}`;
  console.log(result);
  
  if (passed) {
    testResults.passed.push(name);
  } else {
    testResults.failed.push({ name, message });
  }
}

function logWarning(name, message) {
  console.log(`⚠️  ${name}: ${message}`);
  testResults.warnings.push({ name, message });
}

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('\n📊 测试 1: 数据库连接');
  console.log('='.repeat(50));
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      logTest('数据库连接', false, error.message);
      return false;
    }
    
    logTest('数据库连接', true, '成功连接到 Supabase');
    return true;
  } catch (error) {
    logTest('数据库连接', false, error.message);
    return false;
  }
}

// Test 2: Database Tables
async function testDatabaseTables() {
  console.log('\n📋 测试 2: 数据库表结构');
  console.log('='.repeat(50));
  
  const requiredTables = [
    'profiles',
    'verification_codes',
    'test_results',
    'test_submissions',
    'orders',
    'gift_codes',
    'gift_code_redemptions',
    'deepseek_analyses',
    'user_pricing_info',
    'system_config'
  ];
  
  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error && error.code === '42P01') {
        logTest(`表 ${table}`, false, '表不存在');
        allTablesExist = false;
      } else {
        logTest(`表 ${table}`, true);
      }
    } catch (error) {
      logTest(`表 ${table}`, false, error.message);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

// Test 3: System Configuration
async function testSystemConfiguration() {
  console.log('\n⚙️  测试 3: 系统配置');
  console.log('='.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*');
    
    if (error) {
      logTest('系统配置表', false, error.message);
      return false;
    }
    
    logTest('系统配置表', true, `找到 ${data.length} 条配置`);
    
    // Check admin email configuration
    const adminConfig = data.find(c => c.config_key === 'admin_email');
    if (adminConfig) {
      if (adminConfig.config_value === 'your-admin-email@example.com') {
        logWarning('管理员邮箱', '使用默认值，建议修改');
      } else {
        logTest('管理员邮箱配置', true, adminConfig.config_value);
      }
    } else {
      logTest('管理员邮箱配置', false, '未找到配置');
    }
    
    return true;
  } catch (error) {
    logTest('系统配置', false, error.message);
    return false;
  }
}

// Test 4: User Management
async function testUserManagement() {
  console.log('\n👥 测试 4: 用户管理');
  console.log('='.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      logTest('用户查询', false, error.message);
      return false;
    }
    
    logTest('用户查询', true, `找到 ${data.length} 个用户`);
    
    // Check for admin users
    const adminUsers = data.filter(u => u.role === 'admin');
    if (adminUsers.length === 0) {
      logWarning('管理员账号', '未找到管理员账号');
    } else {
      logTest('管理员账号', true, `找到 ${adminUsers.length} 个管理员`);
      adminUsers.forEach(admin => {
        console.log(`   📧 ${admin.email}`);
      });
    }
    
    return true;
  } catch (error) {
    logTest('用户管理', false, error.message);
    return false;
  }
}

// Test 5: Gift Code System
async function testGiftCodeSystem() {
  console.log('\n🎁 测试 5: 礼品码系统');
  console.log('='.repeat(50));
  
  try {
    // Check gift_codes table
    const { data: giftCodes, error: giftError } = await supabase
      .from('gift_codes')
      .select('*');
    
    if (giftError) {
      logTest('礼品码查询', false, giftError.message);
      return false;
    }
    
    logTest('礼品码查询', true, `找到 ${giftCodes.length} 个礼品码`);
    
    if (giftCodes.length > 0) {
      const activeCodes = giftCodes.filter(c => c.is_active);
      const expiredCodes = giftCodes.filter(c => c.expires_at && new Date(c.expires_at) < new Date());
      const availableCodes = giftCodes.filter(c => 
        c.is_active && 
        c.current_redemptions < c.max_redemptions &&
        (!c.expires_at || new Date(c.expires_at) > new Date())
      );
      
      console.log(`   ✅ 激活的礼品码: ${activeCodes.length}`);
      console.log(`   ⏰ 已过期: ${expiredCodes.length}`);
      console.log(`   🎯 可用: ${availableCodes.length}`);
      
      // Show sample codes
      if (availableCodes.length > 0) {
        console.log('\n   可用礼品码示例:');
        availableCodes.slice(0, 3).forEach(code => {
          console.log(`   📝 ${code.code} (${code.current_redemptions}/${code.max_redemptions})`);
        });
      }
    }
    
    // Check redemptions
    const { data: redemptions, error: redemptionError } = await supabase
      .from('gift_code_redemptions')
      .select('*');
    
    if (redemptionError) {
      logTest('礼品码兑换记录', false, redemptionError.message);
    } else {
      logTest('礼品码兑换记录', true, `找到 ${redemptions.length} 条兑换记录`);
    }
    
    return true;
  } catch (error) {
    logTest('礼品码系统', false, error.message);
    return false;
  }
}

// Test 6: Order System
async function testOrderSystem() {
  console.log('\n💳 测试 6: 订单系统');
  console.log('='.repeat(50));
  
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');
    
    if (error) {
      logTest('订单查询', false, error.message);
      return false;
    }
    
    logTest('订单查询', true, `找到 ${orders.length} 个订单`);
    
    if (orders.length > 0) {
      const completedOrders = orders.filter(o => o.status === 'completed');
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0) / 100;
      
      console.log(`   ✅ 已完成: ${completedOrders.length}`);
      console.log(`   ⏳ 待支付: ${pendingOrders.length}`);
      console.log(`   💰 总收入: ¥${totalRevenue.toFixed(2)}`);
    }
    
    return true;
  } catch (error) {
    logTest('订单系统', false, error.message);
    return false;
  }
}

// Test 7: Pricing System
async function testPricingSystem() {
  console.log('\n💰 测试 7: 定价系统');
  console.log('='.repeat(50));
  
  try {
    const { data: pricingInfo, error } = await supabase
      .from('user_pricing_info')
      .select('*');
    
    if (error) {
      logTest('定价信息查询', false, error.message);
      return false;
    }
    
    logTest('定价信息查询', true, `找到 ${pricingInfo.length} 条定价记录`);
    
    if (pricingInfo.length > 0) {
      const priceDistribution = {
        first: pricingInfo.filter(p => p.completed_analyses === 0).length,
        second: pricingInfo.filter(p => p.completed_analyses === 1).length,
        loyal: pricingInfo.filter(p => p.completed_analyses >= 2).length
      };
      
      console.log(`   🆕 首次购买价格 (¥3.99): ${priceDistribution.first} 用户`);
      console.log(`   🔄 第二次价格 (¥2.99): ${priceDistribution.second} 用户`);
      console.log(`   ⭐ 老用户价格 (¥1.99): ${priceDistribution.loyal} 用户`);
    }
    
    return true;
  } catch (error) {
    logTest('定价系统', false, error.message);
    return false;
  }
}

// Test 8: Test Results
async function testTestResults() {
  console.log('\n📝 测试 8: 测试结果系统');
  console.log('='.repeat(50));
  
  try {
    const { data: results, error } = await supabase
      .from('test_results')
      .select('*');
    
    if (error) {
      logTest('测试结果查询', false, error.message);
      return false;
    }
    
    logTest('测试结果查询', true, `找到 ${results.length} 条测试结果`);
    
    if (results.length > 0) {
      const investmentStyles = {};
      results.forEach(r => {
        if (r.investment_style) {
          investmentStyles[r.investment_style] = (investmentStyles[r.investment_style] || 0) + 1;
        }
      });
      
      console.log('\n   投资风格分布:');
      Object.entries(investmentStyles).forEach(([style, count]) => {
        console.log(`   📊 ${style}: ${count}`);
      });
    }
    
    return true;
  } catch (error) {
    logTest('测试结果系统', false, error.message);
    return false;
  }
}

// Test 9: DeepSeek Analysis
async function testDeepSeekAnalysis() {
  console.log('\n🤖 测试 9: DeepSeek AI 分析');
  console.log('='.repeat(50));
  
  try {
    const { data: analyses, error } = await supabase
      .from('deepseek_analyses')
      .select('*');
    
    if (error) {
      logTest('AI 分析查询', false, error.message);
      return false;
    }
    
    logTest('AI 分析查询', true, `找到 ${analyses.length} 条分析记录`);
    
    if (analyses.length > 0) {
      console.log(`   📈 已生成分析: ${analyses.length}`);
    }
    
    return true;
  } catch (error) {
    logTest('DeepSeek 分析', false, error.message);
    return false;
  }
}

// Test 10: Environment Configuration
async function testEnvironmentConfig() {
  console.log('\n🔧 测试 10: 环境配置');
  console.log('='.repeat(50));
  
  const configs = [
    { name: 'VITE_SUPABASE_URL', value: process.env.VITE_SUPABASE_URL, required: true },
    { name: 'VITE_SUPABASE_ANON_KEY', value: process.env.VITE_SUPABASE_ANON_KEY, required: true },
    { name: 'VITE_APP_ID', value: process.env.VITE_APP_ID, required: true },
    { name: 'VITE_ADMIN_EMAIL', value: process.env.VITE_ADMIN_EMAIL, required: false },
    { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, required: false },
    { name: 'DEEPSEEK_API_KEY', value: process.env.DEEPSEEK_API_KEY, required: false }
  ];
  
  configs.forEach(config => {
    if (config.required) {
      if (config.value) {
        logTest(config.name, true, '已配置');
      } else {
        logTest(config.name, false, '缺少必需配置');
      }
    } else {
      if (config.value) {
        logTest(config.name, true, '已配置（可选）');
      } else {
        logWarning(config.name, '未配置（可选）');
      }
    }
  });
  
  return true;
}

// Generate Test Report
function generateReport() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试报告');
  console.log('='.repeat(50));
  
  const total = testResults.passed.length + testResults.failed.length;
  const passRate = total > 0 ? (testResults.passed.length / total * 100).toFixed(1) : 0;
  
  console.log(`\n✅ 通过: ${testResults.passed.length}`);
  console.log(`❌ 失败: ${testResults.failed.length}`);
  console.log(`⚠️  警告: ${testResults.warnings.length}`);
  console.log(`📈 通过率: ${passRate}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.failed.forEach(({ name, message }) => {
      console.log(`   • ${name}: ${message}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  警告信息:');
    testResults.warnings.forEach(({ name, message }) => {
      console.log(`   • ${name}: ${message}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (testResults.failed.length === 0) {
    console.log('🎉 所有测试通过！系统运行正常。');
  } else {
    console.log('⚠️  部分测试失败，请检查上述错误信息。');
  }
  
  console.log('='.repeat(50));
}

// Main test execution
async function runAllTests() {
  console.log('🚀 开始自动化测试...');
  console.log('='.repeat(50));
  
  await testDatabaseConnection();
  await testDatabaseTables();
  await testSystemConfiguration();
  await testUserManagement();
  await testGiftCodeSystem();
  await testOrderSystem();
  await testPricingSystem();
  await testTestResults();
  await testDeepSeekAnalysis();
  await testEnvironmentConfig();
  
  generateReport();
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ 测试执行出错:', error);
  process.exit(1);
});
