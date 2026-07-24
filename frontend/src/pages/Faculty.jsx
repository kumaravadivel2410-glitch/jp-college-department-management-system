import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { UserCheck, Search, Plus, Trash2, X } from 'lucide-react';

const Faculty = () => {
  const { addToast } = useNotification();
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    department: 'CSE',
    designation: 'Assistant Professor',
    qualification: 'M.E. / Ph.D',
    phone: '',
    experienceYears: 5
  });

  const fetchFaculty = async () => {
    try {
      const res = await API.get(`/faculty?search=${search}&department=${deptFilter}`);
      if (res.data) setFaculty(res.data);
    } catch (err) {
      console.log('Error fetching faculty');
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [search, deptFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/faculty', formData);
      addToast('Faculty member registered successfully!', 'success');
      setShowModal(false);
      fetchFaculty();
    } catch (err) {
      addToast(err.message || 'Failed to add faculty', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete faculty record?')) return;
    try {
      await API.delete(`/faculty/${id}`);
      addToast('Faculty deleted successfully', 'success');
      fetchFaculty();
    } catch (err) {
      setFaculty(prev => prev.filter(f => f._id !== id));
      addToast('Faculty record removed', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck color="#2563eb" /> Faculty Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage professors, assistant professors, departments and academic experience</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> Register Faculty
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search Faculty ID, Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--text-main)' }}
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: 600 }}
        >
          <option value="All">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>FACULTY ID</th>
              <th style={{ padding: '0.75rem' }}>NAME</th>
              <th style={{ padding: '0.75rem' }}>DEPARTMENT</th>
              <th style={{ padding: '0.75rem' }}>DESIGNATION</th>
              <th style={{ padding: '0.75rem' }}>EXPERIENCE</th>
              <th style={{ padding: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {faculty.length > 0 ? (
              faculty.map(f => (
                <tr key={f._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{f.facultyId}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{f.department}</td>
                  <td style={{ padding: '0.75rem' }}>{f.designation}</td>
                  <td style={{ padding: '0.75rem' }}>{f.experienceYears} Yrs</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleDelete(f._id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No faculty records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Register New Faculty</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="Faculty ID (e.g. JPC-FAC-105)" required value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
              <input type="text" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Register Faculty</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
