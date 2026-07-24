import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart3 } from 'lucide-react';

const SemesterMarks = () => {
  const [semesterMarks, setSemesterMarks] = useState([
    { _id: '1', studentRoll: '951121104001', studentName: 'Karthik Kumar', department: 'CSE', semester: 5, gpa: 8.80, status: 'Pass', subjectsCount: 6, arrearsCount: 0 },
    { _id: '2', studentRoll: '951121104002', studentName: 'Priya Dharshini', department: 'CSE', semester: 5, gpa: 9.35, status: 'Pass', subjectsCount: 6, arrearsCount: 0 },
    { _id: '3', studentRoll: '951121104003', studentName: 'Arun Prakash', department: 'ECE', semester: 5, gpa: 7.90, status: 'Pass', subjectsCount: 6, arrearsCount: 0 }
  ]);

  useEffect(() => {
    const fetchSemMarks = async () => {
      try {
        const res = await API.get('/semestermarks');
        if (res.data && res.data.length > 0) setSemesterMarks(res.data);
      } catch (err) {
        console.log('Using local semester marks state');
      }
    };
    fetchSemMarks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 color="#2563eb" /> Semester Examination Results & GPA
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>End semester GPA, overall result status, and arrear tracking</p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>ROLL NO</th>
              <th style={{ padding: '0.75rem' }}>STUDENT NAME</th>
              <th style={{ padding: '0.75rem' }}>DEPARTMENT</th>
              <th style={{ padding: '0.75rem' }}>SEMESTER</th>
              <th style={{ padding: '0.75rem' }}>GPA</th>
              <th style={{ padding: '0.75rem' }}>ARREARS</th>
              <th style={{ padding: '0.75rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {semesterMarks.map(sm => (
              <tr key={sm._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{sm.studentRoll}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{sm.studentName}</td>
                <td style={{ padding: '0.75rem' }}>{sm.department}</td>
                <td style={{ padding: '0.75rem' }}>Sem {sm.semester}</td>
                <td style={{ padding: '0.75rem', fontWeight: 800, color: '#16a34a' }}>{sm.gpa}</td>
                <td style={{ padding: '0.75rem' }}>{sm.arrearsCount}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}>
                    {sm.status}
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

export default SemesterMarks;
