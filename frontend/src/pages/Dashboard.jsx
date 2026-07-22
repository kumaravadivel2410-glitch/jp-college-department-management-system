import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Users, UserSquare2, Building2, BookOpen, CalendarCheck, Award, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await apiClient.get('/stats');
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const deptData = [
    { name: 'AI & DS', count: stats?.studentsByDepartment?.['AI & DS'] || 25 },
    { name: 'CSE', count: stats?.studentsByDepartment?.['CSE'] || 18 },
    { name: 'ECE', count: stats?.studentsByDepartment?.['ECE'] || 12 },
    { name: 'EEE', count: stats?.studentsByDepartment?.['EEE'] || 8 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> Welcome Back
          </div>
          <h1 className="text-2xl font-extrabold">{user?.name || 'Academic Administrator'}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Department Management ERP Portal ({user?.role?.toUpperCase().replace('_', ' ') || 'SUPER ADMIN'})
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{stats?.studentCount || 52}</h3>
          </div>
        </div>

        <div className="card-glass p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold">
            <UserSquare2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Faculty Members</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats?.facultyCount || 12}</h3>
          </div>
        </div>

        <div className="card-glass p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Departments</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.departmentCount || 6}</h3>
          </div>
        </div>

        <div className="card-glass p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Avg Attendance Rate</p>
            <h3 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{stats?.attendanceRatio || 95.8}%</h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" /> Student Enrollment Distribution by Department
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Enrolled Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
