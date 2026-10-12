import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Home redirect: send to dashboard (ProtectedRoute will route to /login if unauthenticated) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* Public-only routes (Guests only) */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Protected routes (Authenticated users only) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
                    <p style={{ color: 'var(--text-muted)' }}>The page you requested does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;