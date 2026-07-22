import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// AI Pages
const AIDashboard = lazy(() => import('./pages/ai/AIDashboard'));
const StudentPrediction = lazy(() => import('./pages/ai/StudentPrediction'));
const AttendancePrediction = lazy(() => import('./pages/ai/AttendancePrediction'));
const PerformanceAnalytics = lazy(() => import('./pages/ai/PerformanceAnalytics'));
const ModelManagement = lazy(() => import('./pages/ai/ModelManagement'));
const AIReports = lazy(() => import('./pages/ai/AIReports'));

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="p-12 text-center text-slate-500 font-semibold text-xs flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected ERP & AI Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                
                {/* Machine Learning Module Routes */}
                <Route path="/ai-dashboard" element={<Layout><AIDashboard /></Layout>} />
                <Route path="/ai-predictions" element={<Layout><StudentPrediction /></Layout>} />
                <Route path="/ai-attendance-predictions" element={<Layout><AttendancePrediction /></Layout>} />
                <Route path="/ai-analytics" element={<Layout><PerformanceAnalytics /></Layout>} />
                <Route path="/ai-models" element={<Layout><ModelManagement /></Layout>} />
                <Route path="/ai-reports" element={<Layout><AIReports /></Layout>} />

                {/* Default Route Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
