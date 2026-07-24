import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { History as HistoryIcon, Clock } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([
    { _id: '1', action: 'System Initialization & Database Seed', performedBy: 'System Auto-Seeder', role: 'Admin', ipAddress: '127.0.0.1', details: 'Initialized collections with default JP College data.', createdAt: '2026-07-23 09:00' },
    { _id: '2', action: 'User Login', performedBy: 'Dr. S. Ramesh', role: 'Admin', ipAddress: '192.168.1.10', details: 'Successful JWT authentication', createdAt: '2026-07-23 09:15' }
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/history');
        if (res.data && res.data.length > 0) setHistory(res.data);
      } catch (err) {
        console.log('Using local audit history');
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon color="#2563eb" /> System Audit Log & History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Security log of all administrative actions, data edits, logins, and backups</p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>ACTION</th>
              <th style={{ padding: '0.75rem' }}>PERFORMED BY</th>
              <th style={{ padding: '0.75rem' }}>DETAILS</th>
              <th style={{ padding: '0.75rem' }}>IP ADDRESS</th>
              <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{h.action}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 600 }}>{h.performedBy}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.role}</div>
                </td>
                <td style={{ padding: '0.75rem' }}>{h.details}</td>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{h.ipAddress}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.createdAt ? String(h.createdAt).replace('T', ' ').substring(0, 16) : 'Just now'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
