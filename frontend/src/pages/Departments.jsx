import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Building2, Users, UserCheck, Calendar } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([
    { _id: '1', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. M. Sundaram', totalFaculty: 18, totalStudents: 480, establishedYear: 2011 },
    { _id: '2', code: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Dr. V. Rajesh', totalFaculty: 15, totalStudents: 420, establishedYear: 2011 },
    { _id: '3', code: 'EEE', name: 'Electrical & Electronics Engineering', hod: 'Dr. P. Swaminathan', totalFaculty: 12, totalStudents: 360, establishedYear: 2012 },
    { _id: '4', code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. K. Ganesan', totalFaculty: 20, totalStudents: 500, establishedYear: 2011 },
    { _id: '5', code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. Murugan', totalFaculty: 10, totalStudents: 300, establishedYear: 2013 }
  ]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await API.get('/departments');
        if (res.data && res.data.length > 0) setDepartments(res.data);
      } catch (err) {
        console.log('Using default departments list');
      }
    };
    fetchDepts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 color="#2563eb" /> Academic Departments
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overview of all engineering branches, HOD leadership, and faculty allocations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {departments.map(d => (
          <div key={d._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', padding: '4px 12px', background: '#eff6ff', borderRadius: '8px' }}>{d.code}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estd. {d.establishedYear}</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{d.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>HOD: <b>{d.hod}</b></p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}>
                <Users size={16} /> <b>{d.totalStudents}</b> Students
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9333ea' }}>
                <UserCheck size={16} /> <b>{d.totalFaculty}</b> Faculty
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
