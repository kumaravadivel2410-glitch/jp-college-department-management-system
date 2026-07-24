import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import {
  UserCheck,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Award,
  FileSpreadsheet,
  FileText,
  Clock,
  Plus
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const facId = user?.facultyId || 'JPC-FAC-101';

  const [facultyData, setFacultyData] = useState({
    faculty: {
      name: user?.name || 'Prof. K. Anitha',
      facultyId: facId,
      department: 'CSE',
      designation: 'Associate Professor',
      email: 'faculty@jpcollege.edu'
    },
    assignedSubjects: ['CS8691', 'CS8601'],
    assignedClasses: ['III Year CSE - A']
  });

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const res = await API.get(`/portal/faculty/${facId}`);
        if (res.faculty) setFacultyData(res);
      } catch (err) {
        console.log('Using local faculty portal state');
      }
    };
    fetchFacultyData();
  }, [facId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Faculty Profile Card */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome, {facultyData.faculty.name} 🎓</h1>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
            Faculty ID: <b>{facultyData.faculty.facultyId}</b> | Designation: <b>{facultyData.faculty.designation}</b>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>
            Department: <b>{facultyData.faculty.department}</b> | Email: <b>{facultyData.faculty.email}</b>
          </div>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.8rem' }}>
          Faculty Workload Active
        </div>
      </div>

      {/* Assigned Classes & Subjects Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color="#2563eb" size={20} /> Assigned Class Sections
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {facultyData.assignedClasses.map((cls, idx) => (
              <div key={idx} style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{cls}</span>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Incharge</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen color="#2563eb" size={20} /> Assigned Subjects
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {facultyData.assignedSubjects.map((sub, idx) => (
              <div key={idx} style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{sub}</span>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>Theory</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FacultyDashboard;
