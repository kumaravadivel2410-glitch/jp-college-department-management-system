import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  TrendingUp,
  Award,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 2060,
    faculty: 75,
    departments: 5,
    subjects: 38,
    attendanceRate: 92.4,
    avgCgpa: 8.42
  });

  const departmentData = [
    { name: 'CSE', students: 480, faculty: 18 },
    { name: 'ECE', students: 420, faculty: 15 },
    { name: 'EEE', students: 360, faculty: 12 },
    { name: 'MECH', students: 500, faculty: 20 },
    { name: 'CIVIL', students: 300, faculty: 10 }
  ];

  const attendanceData = [
    { name: 'Present', value: 92 },
    { name: 'Absent', value: 5 },
    { name: 'On Leave', value: 3 }
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b'];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [studRes, facRes, deptRes] = await Promise.all([
          API.get('/students?limit=1'),
          API.get('/faculty?limit=1'),
          API.get('/departments')
        ]);
        if (studRes.pagination) {
          setStats(prev => ({
            ...prev,
            students: studRes.pagination.total || prev.students,
            faculty: facRes.pagination?.total || prev.faculty,
            departments: deptRes.data?.length || prev.departments
          }));
        }
      } catch (err) {
        console.log('Using default dashboard metrics');
      }
    };
    fetchCounts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.02))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Welcome back, {user?.name || 'Academic Administrator'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            J.P. College of Engineering ERP Dashboard — Active Academic Term 2025-2026 (Even Semester)
          </p>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem' }}>
          Role: {user?.role || 'Admin'} View
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL STUDENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.students}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>FACULTY MEMBERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.faculty}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.departments}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATTENDANCE RATE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.attendanceRate}%</div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#2563eb" />
            Department Enrollment & Faculty Strength
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Students" />
                <Bar dataKey="faculty" fill="#9333ea" radius={[6, 6, 0, 0]} name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#16a34a" />
            Overall Campus Attendance Distribution
          </h3>
          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
