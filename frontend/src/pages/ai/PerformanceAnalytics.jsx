import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { TrendingUp, BarChart2, PieChart as PieIcon, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const PerformanceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await apiClient.get('/ai/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const deptRisk = data?.deptRisk || {
    'AI & DS': { total: 25, highRisk: 2, avgGPA: 8.9 },
    'CSE': { total: 20, highRisk: 1, avgGPA: 8.6 },
    'ECE': { total: 15, highRisk: 2, avgGPA: 8.4 },
    'EEE': { total: 10, highRisk: 1, avgGPA: 8.2 }
  };

  const chartData = Object.keys(deptRisk).map(dept => ({
    department: dept,
    students: deptRisk[dept].total,
    highRisk: deptRisk[dept].highRisk,
    avgGPA: deptRisk[dept].avgGPA
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Multi-Dimensional Academic Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental predictions, GPA distributions, and academic trend analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Dept Avg GPA */}
        <div className="card-glass p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Departmental Average Predicted GPA
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="avgGPA" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Predicted GPA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: High Risk Count by Dept */}
        <div className="card-glass p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-red-500" /> High-Risk Students by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="highRisk" fill="#EF4444" radius={[6, 6, 0, 0]} name="High-Risk Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
