import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FileSpreadsheet, Clock, Upload } from 'lucide-react';

const Assignments = () => {
  const { addToast } = useNotification();
  const [assignments, setAssignments] = useState([
    { _id: '1', title: 'Neural Network Forward/Backprop Implementation', subjectCode: 'CS8691', department: 'CSE', facultyName: 'Prof. K. Anitha', dueDate: '2026-07-30', maxMarks: 100, submissionsCount: 42 },
    { _id: '2', title: 'Android UI Layouts & Fragment Navigation Lab', subjectCode: 'CS8601', department: 'CSE', facultyName: 'Dr. M. Sundaram', dueDate: '2026-08-05', maxMarks: 50, submissionsCount: 38 }
  ]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await API.get('/assignments');
        if (res.data && res.data.length > 0) setAssignments(res.data);
      } catch (err) {
        console.log('Using local assignments state');
      }
    };
    fetchAssignments();
  }, []);

  const handleSubmitAssignment = (title) => {
    addToast(`Assignment portal opened for: ${title}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet color="#2563eb" /> Course Assignments & Submissions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>View pending coursework, deadlines, and submission statistics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {assignments.map(a => (
          <div key={a._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8' }}>
                {a.subjectCode}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Due: {a.dueDate}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{a.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Issued by: <b>{a.facultyName}</b> ({a.department})</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Submissions: <b>{a.submissionsCount}</b> / Max: <b>{a.maxMarks} pts</b></span>
              <button
                onClick={() => handleSubmitAssignment(a.title)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <Upload size={14} /> Submit Solution
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
