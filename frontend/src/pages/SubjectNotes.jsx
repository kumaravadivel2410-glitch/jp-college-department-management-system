import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';

const SubjectNotes = () => {
  const { addToast } = useNotification();
  const [notes, setNotes] = useState([
    { _id: '1', title: 'Unit 1: Introduction to AI & State Space Search', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', department: 'CSE', unitNumber: 1, uploadedBy: 'Prof. K. Anitha', fileUrl: '#' },
    { _id: '2', title: 'Unit 2: Knowledge Representation & Logic', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', department: 'CSE', unitNumber: 2, uploadedBy: 'Prof. K. Anitha', fileUrl: '#' },
    { _id: '3', title: 'Unit 1: Mobile Architecture & Cellular Systems', subjectCode: 'CS8601', subjectName: 'Mobile Computing', department: 'CSE', unitNumber: 1, uploadedBy: 'Dr. M. Sundaram', fileUrl: '#' }
  ]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await API.get('/notes');
        if (res.data && res.data.length > 0) setNotes(res.data);
      } catch (err) {
        console.log('Using local notes state');
      }
    };
    fetchNotes();
  }, []);

  const handleDownload = (title) => {
    addToast(`Downloading lecture materials for ${title}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText color="#2563eb" /> Subject Lecture Notes & Study Material
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Access unit-wise PDF lecture notes uploaded by subject faculty</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {notes.map(n => (
          <div key={n._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8' }}>
                  {n.subjectCode} - Unit {n.unitNumber}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.department}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>{n.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Uploaded by: <b>{n.uploadedBy}</b></p>
            </div>
            <button
              onClick={() => handleDownload(n.title)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Download size={15} /> Download PDF Material
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectNotes;
