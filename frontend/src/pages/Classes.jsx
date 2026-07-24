import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { GraduationCap } from 'lucide-react';

const Classes = () => {
  const [classes, setClasses] = useState([
    { _id: '1', className: 'III Year CSE - A', department: 'CSE', year: 3, section: 'A', classIncharge: 'Prof. K. Anitha', roomNumber: 'CS-Lab 3', totalStudents: 60 },
    { _id: '2', className: 'III Year ECE - B', department: 'ECE', year: 3, section: 'B', classIncharge: 'Prof. R. Venkatesh', roomNumber: 'LH-204', totalStudents: 55 },
    { _id: '3', className: 'II Year EEE - A', department: 'EEE', year: 2, section: 'A', classIncharge: 'Dr. P. Swaminathan', roomNumber: 'LH-105', totalStudents: 50 }
  ]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get('/classes');
        if (res.data && res.data.length > 0) setClasses(res.data);
      } catch (err) {
        console.log('Using local classes');
      }
    };
    fetchClasses();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap color="#2563eb" /> Class Sections & Advisory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Class section assignments, faculty incharges, and lecture room allocations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {classes.map(c => (
          <div key={c._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>{c.className}</h3>
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontWeight: 700 }}>{c.roomNumber}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div>Department: <b>{c.department}</b></div>
              <div>Class Incharge: <b>{c.classIncharge}</b></div>
              <div>Total Enrolled: <b>{c.totalStudents} Students</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;
