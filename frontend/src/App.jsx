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

import MainLayout from './layouts/MainLayout';

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
                <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                
                {/* Machine Learning Module Routes */}
                <Route path="/ai-dashboard" element={<MainLayout><AIDashboard /></MainLayout>} />
                <Route path="/ai-predictions" element={<MainLayout><StudentPrediction /></MainLayout>} />
                <Route path="/ai-attendance-predictions" element={<MainLayout><AttendancePrediction /></MainLayout>} />
                <Route path="/ai-analytics" element={<MainLayout><PerformanceAnalytics /></MainLayout>} />
                <Route path="/ai-models" element={<MainLayout><ModelManagement /></MainLayout>} />
                <Route path="/ai-reports" element={<MainLayout><AIReports /></MainLayout>} />

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
