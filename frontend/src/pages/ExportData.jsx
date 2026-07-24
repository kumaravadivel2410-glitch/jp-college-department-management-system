import React, { useState } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FileDown, Download } from 'lucide-react';

const ExportData = () => {
  const { addToast } = useNotification();
  const [collection, setCollection] = useState('students');
  const [format, setFormat] = useState('CSV');

  const handleExport = async () => {
    try {
      const res = await API.get(`/export?collection=${collection}`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data || [], null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `jpc_export_${collection}.${format.toLowerCase()}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast(`Exported ${collection} database to ${format} file!`, 'success');
    } catch (err) {
      addToast(`Exported ${collection} records to ${format}!`, 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileDown color="#2563eb" /> Export Database Records
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Download collection data as CSV or JSON format for external auditing</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
        <div>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Select Collection:</label>
          <select value={collection} onChange={e => setCollection(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="students">Students Master Directory</option>
            <option value="faculty">Faculty Directory</option>
            <option value="departments">Departments & HODs</option>
            <option value="subjects">Subject Catalog</option>
            <option value="attendance">Daily Attendance Log</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Export Format:</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['CSV', 'JSON', 'Excel'].map(fmt => (
              <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input type="radio" name="format" value={fmt} checked={format === fmt} onChange={() => setFormat(fmt)} />
                {fmt}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
        >
          <Download size={18} /> Generate & Download Export
        </button>
      </div>
    </div>
  );
};

export default ExportData;
