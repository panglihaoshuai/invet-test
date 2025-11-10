import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TestModeSelectionPage from './pages/TestModeSelectionPage';
import PersonalityTestPage from './pages/PersonalityTestPage';
import TradingCharacteristicsTestPage from './pages/TradingCharacteristicsTestPage';
import MathFinanceTestPage from './pages/MathFinanceTestPage';
import RiskPreferenceTestPage from './pages/RiskPreferenceTestPage';
import BalloonGamePage from './pages/BalloonGamePage';
import ResultPage from './pages/ResultPage';
import TestHistoryPage from './pages/TestHistoryPage';
import HistoricalResultPage from './pages/HistoricalResultPage';
import TestComparisonPage from './pages/TestComparisonPage';
import GamesHubPage from './pages/GamesHubPage';
import GameHistoryPage from './pages/GameHistoryPage';
import HarvestGamePage from './pages/HarvestGamePage';
import AuctionGamePage from './pages/AuctionGamePage';
import TwoDoorsGamePage from './pages/TwoDoorsGamePage';
import HerdGamePage from './pages/HerdGamePage';
import QuickReactionGamePage from './pages/QuickReactionGamePage';
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
    name: 'Test Mode Selection',
    path: '/test/mode-selection',
    element: <TestModeSelectionPage />
  },
  {
    name: 'Personality Test',
    path: '/test/personality',
    element: <PersonalityTestPage />
  },
  {
    name: 'Trading Characteristics Test',
    path: '/test/trading-characteristics',
    element: <TradingCharacteristicsTestPage />
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
    name: 'Balloon Game',
    path: '/test/balloon-game',
    element: <BalloonGamePage />
  },
  {
    name: 'Result',
    path: '/result',
    element: <ResultPage />
  },
  {
    name: 'Test History',
    path: '/test/history',
    element: <TestHistoryPage />
  },
  {
    name: 'Historical Result',
    path: '/test/history/:testId',
    element: <HistoricalResultPage />
  },
  {
    name: 'Test Comparison',
    path: '/test/compare',
    element: <TestComparisonPage />
  },
  {
    name: 'Games Hub',
    path: '/games',
    element: <GamesHubPage />
  },
  {
    name: 'Game History',
    path: '/games/history',
    element: <GameHistoryPage />
  },
  {
    name: 'Balloon Game Standalone',
    path: '/games/balloon',
    element: <BalloonGamePage />
  },
  {
    name: 'Harvest Game',
    path: '/games/harvest',
    element: <HarvestGamePage />
  },
  {
    name: 'Auction Game',
    path: '/games/auction',
    element: <AuctionGamePage />
  },
  {
    name: 'Two Doors Game',
    path: '/games/two-doors',
    element: <TwoDoorsGamePage />
  },
  {
    name: 'Herd Game',
    path: '/games/herd',
    element: <HerdGamePage />
  },
  {
    name: 'Quick Reaction Game',
    path: '/games/quick-reaction',
    element: <QuickReactionGamePage />
  }
];

export default routes;