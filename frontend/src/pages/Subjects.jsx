import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BookOpen } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([
    { _id: '1', code: 'CS8691', name: 'Artificial Intelligence', department: 'CSE', semester: 6, credits: 4, type: 'Theory' },
    { _id: '2', code: 'CS8601', name: 'Mobile Computing', department: 'CSE', semester: 6, credits: 3, type: 'Theory' },
    { _id: '3', code: 'CS8611', name: 'Mini Project Lab', department: 'CSE', semester: 6, credits: 2, type: 'Practical' },
    { _id: '4', code: 'EC8651', name: 'Transmission Lines & RF', department: 'ECE', semester: 6, credits: 4, type: 'Theory' },
    { _id: '5', code: 'EE8401', name: 'Electrical Machines II', department: 'EEE', semester: 4, credits: 4, type: 'Theory' }
  ]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await API.get('/subjects');
        if (res.data && res.data.length > 0) setSubjects(res.data);
      } catch (err) {
        console.log('Using local subject list');
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen color="#2563eb" /> Subject Curriculum
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Regulation course offerings, credit distribution, and theory/practical classifications</p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>CODE</th>
              <th style={{ padding: '0.75rem' }}>SUBJECT NAME</th>
              <th style={{ padding: '0.75rem' }}>DEPARTMENT</th>
              <th style={{ padding: '0.75rem' }}>SEMESTER</th>
              <th style={{ padding: '0.75rem' }}>CREDITS</th>
              <th style={{ padding: '0.75rem' }}>TYPE</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{s.code}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '0.75rem' }}>{s.department}</td>
                <td style={{ padding: '0.75rem' }}>Semester {s.semester}</td>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{s.credits} Credits</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, background: s.type === 'Theory' ? '#dbeafe' : '#fef3c7', color: s.type === 'Theory' ? '#1d4ed8' : '#b45309' }}>
                    {s.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subjects;
