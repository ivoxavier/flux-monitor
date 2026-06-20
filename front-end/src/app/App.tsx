// src/App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import ptPT from 'antd/locale/pt_PT';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManifestsPage from './pages/ManifestsPage';
import MonitoringPage from './pages/MonitoringPage';
import FlowDetailPage from './pages/FlowDetailPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

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
        components: {
          Card: {
            boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.05)', 
            boxShadow: isDarkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 16px rgba(0, 0, 0, 0.06)',
            borderBg: 'transparent',
          },
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedGroups={['admin', 'operador', 'consulta']}>
                <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/manifests"
            element={
              <ProtectedRoute allowedGroups={['admin', 'operador']}>
                <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                  <ManifestsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute allowedGroups={['admin', 'operador', 'consulta']}>
                <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                  <MonitoringPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedGroups={['admin']}>
                <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/flow/:id"
            element={
              <ProtectedRoute allowedGroups={['admin', 'operador', 'consulta']}>
                <AppLayout isDarkMode={isDarkMode} onThemeChange={setIsDarkMode}>
                  <FlowDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
