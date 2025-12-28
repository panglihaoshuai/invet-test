import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { TestProvider } from '@/contexts/TestContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import routes from './routes';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="flex items-center gap-2">
      <Button variant={language === 'zh' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('zh')}>中文</Button>
      <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>English</Button>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <TestProvider>
            <div className="flex flex-col min-h-screen">
              <header className="w-full flex justify-end p-2">
                <LanguageSwitcher />
              </header>
              <main className="flex-grow">
                <Routes>
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </TestProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
