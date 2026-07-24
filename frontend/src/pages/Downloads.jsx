import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Download, FileText } from 'lucide-react';

const Downloads = () => {
  const { addToast } = useNotification();
  const [downloads, setDownloads] = useState([
    { _id: '1', title: 'Anna University CSE Curriculum 2021 Regulation', category: 'Syllabus', fileSize: '2.4 MB', fileType: 'PDF' },
    { _id: '2', title: 'Academic Calendar 2025-2026', category: 'General', fileSize: '1.1 MB', fileType: 'PDF' },
    { _id: '3', title: 'Student Leave & Bonafide Request Application Form', category: 'Forms', fileSize: '450 KB', fileType: 'PDF' }
  ]);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await API.get('/downloads');
        if (res.data && res.data.length > 0) setDownloads(res.data);
      } catch (err) {
        console.log('Using local downloads list');
      }
    };
    fetchDownloads();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download color="#2563eb" /> Downloads & Forms Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Official college forms, regulation syllabi, calendars, and guidelines</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {downloads.map(d => (
          <div key={d._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8' }}>
                {d.category}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}>{d.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>File Size: {d.fileSize} ({d.fileType})</p>
            </div>
            <button
              onClick={() => addToast(`Downloading file: ${d.title}`, 'success')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Download size={15} /> Download Official Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Downloads;
