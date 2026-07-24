import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Lazy-loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DepartmentHomePage = lazy(() => import('./pages/DepartmentHomePage'));
const DepartmentCMSPage = lazy(() => import('./pages/DepartmentCMSPage'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'));

const Approvals = lazy(() => import('./pages/Approvals'));
const Students = lazy(() => import('./pages/Students'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Departments = lazy(() => import('./pages/Departments'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Classes = lazy(() => import('./pages/Classes'));
const Attendance = lazy(() => import('./pages/Attendance'));
const InternalMarks = lazy(() => import('./pages/InternalMarks'));
const SemesterMarks = lazy(() => import('./pages/SemesterMarks'));
const SubjectNotes = lazy(() => import('./pages/SubjectNotes'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Timetable = lazy(() => import('./pages/Timetable'));
const ImportData = lazy(() => import('./pages/ImportData'));
const ExportData = lazy(() => import('./pages/ExportData'));
const Reports = lazy(() => import('./pages/Reports'));
const Downloads = lazy(() => import('./pages/Downloads'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading Anna University ERP Portal...</p>
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected ERP System Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Admin Master Dashboard */}
                <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                
                {/* Department Home & HOD CMS */}
                <Route path="/department-home/:deptCode" element={<MainLayout><DepartmentHomePage /></MainLayout>} />
                <Route path="/department-cms/:deptCode" element={<MainLayout><DepartmentCMSPage /></MainLayout>} />

                {/* Dedicated Student Portal */}
                <Route path="/student/dashboard" element={<MainLayout><StudentDashboard /></MainLayout>} />

                {/* Dedicated Faculty Portal */}
                <Route path="/faculty/dashboard" element={<MainLayout><FacultyDashboard /></MainLayout>} />

                {/* ERP Modules */}
                <Route path="/approvals" element={<MainLayout><Approvals /></MainLayout>} />
                <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
                <Route path="/faculty" element={<MainLayout><Faculty /></MainLayout>} />
                <Route path="/departments" element={<MainLayout><Departments /></MainLayout>} />
                <Route path="/subjects" element={<MainLayout><Subjects /></MainLayout>} />
                <Route path="/classes" element={<MainLayout><Classes /></MainLayout>} />
                <Route path="/attendance" element={<MainLayout><Attendance /></MainLayout>} />
                <Route path="/internal-marks" element={<MainLayout><InternalMarks /></MainLayout>} />
                <Route path="/semester-marks" element={<MainLayout><SemesterMarks /></MainLayout>} />
                <Route path="/subject-notes" element={<MainLayout><SubjectNotes /></MainLayout>} />
                <Route path="/assignments" element={<MainLayout><Assignments /></MainLayout>} />
                <Route path="/timetable" element={<MainLayout><Timetable /></MainLayout>} />
                <Route path="/import-data" element={<MainLayout><ImportData /></MainLayout>} />
                <Route path="/export-data" element={<MainLayout><ExportData /></MainLayout>} />
                <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
                <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
                <Route path="/history" element={<MainLayout><History /></MainLayout>} />
                <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
                <Route path="/about" element={<MainLayout><About /></MainLayout>} />

                {/* Fallbacks */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
