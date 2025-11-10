import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PersonalityTestPage from './pages/PersonalityTestPage';
import MathFinanceTestPage from './pages/MathFinanceTestPage';
import RiskPreferenceTestPage from './pages/RiskPreferenceTestPage';
import ResultPage from './pages/ResultPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />
  },
  {
    name: 'Personality Test',
    path: '/test/personality',
    element: <PersonalityTestPage />
  },
  {
    name: 'Math Finance Test',
    path: '/test/math-finance',
    element: <MathFinanceTestPage />
  },
  {
    name: 'Risk Preference Test',
    path: '/test/risk-preference',
    element: <RiskPreferenceTestPage />
  },
  {
    name: 'Result',
    path: '/result',
    element: <ResultPage />
  }
];

export default routes;