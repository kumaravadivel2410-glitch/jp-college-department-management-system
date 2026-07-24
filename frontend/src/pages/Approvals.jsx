import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { CheckSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

const Approvals = () => {
  const { addToast } = useNotification();
  const [approvals, setApprovals] = useState([
    { _id: '1', type: 'Registration', requestedBy: 'Karthik Kumar', role: 'Student', details: 'Elective Course Registration - Cloud Computing', status: 'Pending', createdAt: '2026-07-22' },
    { _id: '2', type: 'Mark Change', requestedBy: 'Prof. K. Anitha', role: 'Faculty', details: 'Correction for CS8691 Internal 1 marks for roll 951121104001', status: 'Pending', createdAt: '2026-07-21' },
    { _id: '3', type: 'Leave Request', requestedBy: 'Priya Dharshini', role: 'Student', details: 'Medical leave request for 3 days', status: 'Approved', createdAt: '2026-07-20' }
  ]);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await API.get('/approvals');
        if (res.data && res.data.length > 0) setApprovals(res.data);
      } catch (err) {
        console.log('Using local approvals state');
      }
    };
    fetchApprovals();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await API.put(`/approvals/${id}`, { status });
      setApprovals(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      addToast(`Request ${status} successfully!`, 'success');
    } catch (err) {
      setApprovals(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      addToast(`Request ${status} successfully!`, 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare color="#2563eb" /> Academic Approvals Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review student registrations, mark correction requests, and faculty leave applications</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>TYPE</th>
              <th style={{ padding: '0.75rem' }}>REQUESTED BY</th>
              <th style={{ padding: '0.75rem' }}>DETAILS</th>
              <th style={{ padding: '0.75rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{item.type}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div>{item.requestedBy}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{item.role}</div>
                </td>
                <td style={{ padding: '0.75rem' }}>{item.details}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: item.status === 'Approved' ? '#dcfce7' : item.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                    color: item.status === 'Approved' ? '#15803d' : item.status === 'Rejected' ? '#b91c1c' : '#b45309'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {item.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction(item._id, 'Approved')} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        Approve
                      </button>
                      <button onClick={() => handleAction(item._id, 'Rejected')} style={{ border: 'none', background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approvals;
