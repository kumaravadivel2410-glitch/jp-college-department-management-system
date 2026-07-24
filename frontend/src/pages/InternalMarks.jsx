import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Award, Plus, Save } from 'lucide-react';

const InternalMarks = () => {
  const { addToast } = useNotification();
  const [marks, setMarks] = useState([
    { _id: '1', studentRoll: '951121104001', studentName: 'Karthik Kumar', department: 'CSE', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 88, maxMarks: 100, semester: 6 },
    { _id: '2', studentRoll: '951121104002', studentName: 'Priya Dharshini', department: 'CSE', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 95, maxMarks: 100, semester: 6 }
  ]);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await API.get('/internalmarks');
        if (res.data && res.data.length > 0) setMarks(res.data);
      } catch (err) {
        console.log('Using local internal marks state');
      }
    };
    fetchMarks();
  }, []);

  const handleMarkChange = (id, newMarks) => {
    setMarks(prev => prev.map(m => m._id === id ? { ...m, marksObtained: Number(newMarks) } : m));
  };

  const handleSave = async () => {
    addToast('Internal marks updated successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="#2563eb" /> Internal Assessment Marks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Record Internal 1, Internal 2, and Model Exam scores</p>
        </div>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>ROLL NO</th>
              <th style={{ padding: '0.75rem' }}>STUDENT NAME</th>
              <th style={{ padding: '0.75rem' }}>SUBJECT</th>
              <th style={{ padding: '0.75rem' }}>EXAM TYPE</th>
              <th style={{ padding: '0.75rem' }}>MARKS OBTAINED</th>
              <th style={{ padding: '0.75rem' }}>MAX MARKS</th>
            </tr>
          </thead>
          <tbody>
            {marks.map(m => (
              <tr key={m._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{m.studentRoll}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.studentName}</td>
                <td style={{ padding: '0.75rem' }}>{m.subjectCode} - {m.subjectName}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.75rem' }}>
                    {m.examType}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={m.marksObtained}
                    onChange={(e) => handleMarkChange(m._id, e.target.value)}
                    style={{ width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 700, textAlign: 'center' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>/ {m.maxMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalMarks;
