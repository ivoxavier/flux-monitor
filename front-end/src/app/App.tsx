import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import ptPT from 'antd/locale/pt_PT';
import AppLayout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManifestsPage from './pages/ManifestsPage';
import MonitoringPage from './pages/MonitoringPage';
import UsersPage from './pages/UsersPage';
import FlowDetailPage from './pages/FlowDetailPage';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ConfigProvider
      locale={ptPT}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/manifests"
            element={
              <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                <ManifestsPage />
              </AppLayout>
            }
          />
          <Route
            path="/monitoring"
            element={
              <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                <MonitoringPage />
              </AppLayout>
            }
          />
          <Route
            path="/users"
            element={
              <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                <UsersPage />
              </AppLayout>
            }
          />
          <Route
            path="/flow/:id"
            element={
              <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                <FlowDetailPage />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}