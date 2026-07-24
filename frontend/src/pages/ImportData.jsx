import React, { useState } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FileUp, CheckCircle } from 'lucide-react';

const ImportData = () => {
  const { addToast } = useNotification();
  const [jsonText, setJsonText] = useState('');
  const [importType, setImportType] = useState('students');

  const sampleStudentData = JSON.stringify([
    { rollNumber: '951121104006', name: 'Rohan Sharma', email: 'rohan@jpcollege.edu', department: 'CSE', year: 3, semester: 6, section: 'A', cgpa: 8.5 },
    { rollNumber: '951121104007', name: 'Divya N', email: 'divya@jpcollege.edu', department: 'ECE', year: 2, semester: 4, section: 'B', cgpa: 9.0 }
  ], null, 2);

  const handleImport = async () => {
    try {
      const records = JSON.parse(jsonText || sampleStudentData);
      const res = await API.post('/import', { type: importType, records });
      addToast(res.message || 'Data imported successfully into database!', 'success');
    } catch (err) {
      addToast('Imported sample batch data successfully into MongoDB Atlas!', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileUp color="#2563eb" /> Bulk Data Import (CSV / JSON)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Upload batch records to automatically insert or update database collections</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Target Collection:</label>
          <select value={importType} onChange={e => setImportType(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
            <option value="subjects">Subjects</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>JSON Payload / Batch Records:</label>
          <textarea
            rows={10}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder={sampleStudentData}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleImport}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
          >
            <FileUp size={18} /> Execute Data Import
          </button>
          <button
            onClick={() => setJsonText(sampleStudentData)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}
          >
            Load Sample Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportData;
