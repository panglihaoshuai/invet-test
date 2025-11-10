import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TestProgress, PersonalityScores, MathFinanceScores, RiskPreferenceScores, TradingCharacteristics } from '@/types/types';

interface TestContextType {
  testId: string | null;
  setTestId: (id: string) => void;
  progress: TestProgress;
  setProgress: (progress: TestProgress) => void;
  personalityScores: PersonalityScores | null;
  setPersonalityScores: (scores: PersonalityScores) => void;
  tradingCharacteristics: TradingCharacteristics | null;
  setTradingCharacteristics: (characteristics: TradingCharacteristics) => void;
  mathFinanceScores: MathFinanceScores | null;
  setMathFinanceScores: (scores: MathFinanceScores) => void;
  riskPreferenceScores: RiskPreferenceScores | null;
  setRiskPreferenceScores: (scores: RiskPreferenceScores) => void;
  resetTest: () => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testId, setTestId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TestProgress>({
    current_step: 0,
    total_steps: 4,
    completed_tests: []
  });
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores | null>(null);
  const [tradingCharacteristics, setTradingCharacteristics] = useState<TradingCharacteristics | null>(null);
  const [mathFinanceScores, setMathFinanceScores] = useState<MathFinanceScores | null>(null);
  const [riskPreferenceScores, setRiskPreferenceScores] = useState<RiskPreferenceScores | null>(null);

  // 从 localStorage 恢复测试状态
  useEffect(() => {
    const savedTestId = localStorage.getItem('currentTestId');
    const savedProgress = localStorage.getItem('testProgress');
    const savedPersonality = localStorage.getItem('personalityScores');
    const savedTradingCharacteristics = localStorage.getItem('tradingCharacteristics');
    const savedMathFinance = localStorage.getItem('mathFinanceScores');
    const savedRiskPreference = localStorage.getItem('riskPreferenceScores');

    if (savedTestId) setTestId(savedTestId);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error parsing saved progress:', error);
      }
    }
    if (savedPersonality) {
      try {
        setPersonalityScores(JSON.parse(savedPersonality));
      } catch (error) {
        console.error('Error parsing saved personality scores:', error);
      }
    }
    if (savedTradingCharacteristics) {
      try {
        setTradingCharacteristics(JSON.parse(savedTradingCharacteristics));
      } catch (error) {
        console.error('Error parsing saved trading characteristics:', error);
      }
    }
    if (savedMathFinance) {
      try {
        setMathFinanceScores(JSON.parse(savedMathFinance));
      } catch (error) {
        console.error('Error parsing saved math finance scores:', error);
      }
    }
    if (savedRiskPreference) {
      try {
        setRiskPreferenceScores(JSON.parse(savedRiskPreference));
      } catch (error) {
        console.error('Error parsing saved risk preference scores:', error);
      }
    }
  }, []);

  // 保存测试状态到 localStorage
  useEffect(() => {
    if (testId) {
      localStorage.setItem('currentTestId', testId);
    }
  }, [testId]);

  useEffect(() => {
    localStorage.setItem('testProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (personalityScores) {
      localStorage.setItem('personalityScores', JSON.stringify(personalityScores));
    }
  }, [personalityScores]);

  useEffect(() => {
    if (tradingCharacteristics) {
      localStorage.setItem('tradingCharacteristics', JSON.stringify(tradingCharacteristics));
    }
  }, [tradingCharacteristics]);

  useEffect(() => {
    if (mathFinanceScores) {
      localStorage.setItem('mathFinanceScores', JSON.stringify(mathFinanceScores));
    }
  }, [mathFinanceScores]);

  useEffect(() => {
    if (riskPreferenceScores) {
      localStorage.setItem('riskPreferenceScores', JSON.stringify(riskPreferenceScores));
    }
  }, [riskPreferenceScores]);

  const resetTest = () => {
    setTestId(null);
    setProgress({
      current_step: 0,
      total_steps: 4,
      completed_tests: []
    });
    setPersonalityScores(null);
    setTradingCharacteristics(null);
    setMathFinanceScores(null);
    setRiskPreferenceScores(null);
    localStorage.removeItem('currentTestId');
    localStorage.removeItem('testProgress');
    localStorage.removeItem('personalityScores');
    localStorage.removeItem('tradingCharacteristics');
    localStorage.removeItem('mathFinanceScores');
    localStorage.removeItem('riskPreferenceScores');
  };

  return (
    <TestContext.Provider
      value={{
        testId,
        setTestId,
        progress,
        setProgress,
        personalityScores,
        setPersonalityScores,
        tradingCharacteristics,
        setTradingCharacteristics,
        mathFinanceScores,
        setMathFinanceScores,
        riskPreferenceScores,
        setRiskPreferenceScores,
        resetTest
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
