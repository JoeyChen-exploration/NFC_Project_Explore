import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/apple.css';
import './styles/minimalism.css';
import './styles/textures.css';

// 使用懒加载提高初始加载速度
const AuthPage = lazy(() => import('./pages/AuthPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const PublicPage = lazy(() => import('./pages/PublicPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const FrontendShowcasePage = lazy(() => import('./pages/FrontendShowcasePage'));
const NfcFocusedDashboard = lazy(() => import('./pages/NfcFocusedDashboard'));

// 只在开发环境导入测试页面
let TestResponsive = null;
if (import.meta.env.DEV) {
  import('./pages/TestResponsive.jsx')
    .then(module => {
      TestResponsive = module.default;
    })
    .catch(() => {
      // 如果测试页面不存在，静默失败
      TestResponsive = null;
    });
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#555',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        加载中...
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

// 加载中的骨架屏
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#555',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      加载页面中...
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <NfcFocusedDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/editor"
              element={
                <PrivateRoute>
                  <EditorPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsPage />
                </PrivateRoute>
              }
            />
            <Route path="/nfc" element={<Navigate to="/dashboard" replace />} />
            <Route path="/:username" element={<PublicPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/showcase" element={<FrontendShowcasePage />} />

            {/* 只在开发环境显示测试路由 */}
            {import.meta.env.DEV && TestResponsive && (
              <Route path="/test-responsive" element={<TestResponsive />} />
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
