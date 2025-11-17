// 本地存储工具类
// 所有测试结果和游戏历史记录都存储在本地浏览器中

import type { TestResult, GameResult, DeepSeekAnalysis } from '@/types/types';

const STORAGE_KEYS = {
  TEST_RESULTS: 'investment_test_results',
  GAME_RESULTS: 'investment_game_results',
  CURRENT_TEST: 'investment_current_test',
  USER_PREFERENCES: 'investment_user_preferences',
  DEEPSEEK_ANALYSES: 'investment_deepseek_analyses'
};

// 测试结果本地存储
export const testResultStorage = {
  // 保存测试结果
  saveTestResult(result: TestResult): void {
    try {
      const results = this.getAllTestResults();
      results.push(result);
      localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(results));
    } catch (error) {
      console.error('保存测试结果失败:', error);
      throw new Error('本地存储空间不足，请清理浏览器数据');
    }
  },

  // 获取所有测试结果
  getAllTestResults(): TestResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取测试结果失败:', error);
      return [];
    }
  },

  // 根据ID获取测试结果
  getTestResultById(id: string): TestResult | null {
    const results = this.getAllTestResults();
    return results.find(r => r.id === id) || null;
  },

  // 删除测试结果
  deleteTestResult(id: string): void {
    const results = this.getAllTestResults();
    const filtered = results.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(filtered));
  },

  // 清空所有测试结果
  clearAllTestResults(): void {
    localStorage.removeItem(STORAGE_KEYS.TEST_RESULTS);
  },

  // 导出测试结果（用于备份）
  exportTestResults(): string {
    const results = this.getAllTestResults();
    return JSON.stringify(results, null, 2);
  }
};

// 游戏结果本地存储
export const gameResultStorage = {
  // 保存游戏结果
  saveGameResult(result: GameResult): void {
    try {
      const results = this.getAllGameResults();
      results.push(result);
      localStorage.setItem(STORAGE_KEYS.GAME_RESULTS, JSON.stringify(results));
    } catch (error) {
      console.error('保存游戏结果失败:', error);
      throw new Error('本地存储空间不足，请清理浏览器数据');
    }
  },

  // 获取所有游戏结果
  getAllGameResults(): GameResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取游戏结果失败:', error);
      return [];
    }
  },

  // 根据游戏类型获取结果
  getGameResultsByType(gameType: string): GameResult[] {
    const results = this.getAllGameResults();
    return results.filter(r => r.game_type === gameType);
  },

  // 删除游戏结果
  deleteGameResult(id: string): void {
    const results = this.getAllGameResults();
    const filtered = results.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.GAME_RESULTS, JSON.stringify(filtered));
  },

  // 清空所有游戏结果
  clearAllGameResults(): void {
    localStorage.removeItem(STORAGE_KEYS.GAME_RESULTS);
  },

  // 导出游戏结果
  exportGameResults(): string {
    const results = this.getAllGameResults();
    return JSON.stringify(results, null, 2);
  }
};

// 当前测试状态存储
export const currentTestStorage = {
  // 保存当前测试进度
  saveCurrentTest(testData: any): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TEST, JSON.stringify(testData));
  },

  // 获取当前测试进度
  getCurrentTest(): any {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEST);
    return data ? JSON.parse(data) : null;
  },

  // 清除当前测试进度
  clearCurrentTest(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEST);
  }
};

// 用户偏好设置
export const userPreferencesStorage = {
  // 保存用户偏好
  savePreferences(preferences: any): void {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  },

  // 获取用户偏好
  getPreferences(): any {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {};
  },

  // 更新单个偏好
  updatePreference(key: string, value: any): void {
    const preferences = this.getPreferences();
    preferences[key] = value;
    this.savePreferences(preferences);
  }
};

// 存储空间检查
export const storageUtils = {
  // 检查存储空间使用情况
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // 大多数浏览器的 localStorage 限制是 5-10MB
    const total = 5 * 1024 * 1024; // 假设 5MB
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  },

  // 检查是否有足够空间
  hasEnoughSpace(requiredBytes: number = 1024 * 1024): boolean {
    const { used, total } = this.getStorageUsage();
    return (total - used) > requiredBytes;
  },

  // 清理所有应用数据
  clearAllAppData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // 导出所有数据
  exportAllData(): string {
    const allData = {
      testResults: testResultStorage.getAllTestResults(),
      gameResults: gameResultStorage.getAllGameResults(),
      deepseekAnalyses: deepseekAnalysisStorage.getAllAnalyses(),
      preferences: userPreferencesStorage.getPreferences(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(allData, null, 2);
  }
};

// DeepSeek 分析本地存储
export const deepseekAnalysisStorage = {
  saveAnalysis(analysis: DeepSeekAnalysis): void {
    const list = this.getAllAnalyses();
    // 去重：按 test_result_id 覆盖
    const filtered = list.filter(a => a.test_result_id !== analysis.test_result_id);
    filtered.push(analysis);
    localStorage.setItem(STORAGE_KEYS.DEEPSEEK_ANALYSES, JSON.stringify(filtered));
  },

  getAllAnalyses(): DeepSeekAnalysis[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEEPSEEK_ANALYSES);
    return data ? JSON.parse(data) : [];
  },

  getByTestResultId(testResultId: string): DeepSeekAnalysis | null {
    const list = this.getAllAnalyses();
    return list.find(a => a.test_result_id === testResultId) || null;
  },

  deleteByTestResultId(testResultId: string): void {
    const list = this.getAllAnalyses().filter(a => a.test_result_id !== testResultId);
    localStorage.setItem(STORAGE_KEYS.DEEPSEEK_ANALYSES, JSON.stringify(list));
  },

  exportOne(testResultId: string): string {
    const a = this.getByTestResultId(testResultId);
    return JSON.stringify(a ?? {}, null, 2);
  },

  exportAll(): string {
    return JSON.stringify(this.getAllAnalyses(), null, 2);
  }
};
