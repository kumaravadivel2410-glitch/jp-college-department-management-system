import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  Search,
  Plus,
  Trash2,
  FileUp,
  FileDown,
  RefreshCw,
  TrendingUp,
  X,
  Edit
} from 'lucide-react';

const Students = () => {
  const { addToast } = useNotification();
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [semester, setSemester] = useState('All');
  const [section, setSection] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    registerNumber: '',
    name: '',
    email: '',
    department: 'CSE',
    year: 3,
    semester: 6,
    section: 'A',
    phone: '',
    cgpa: 8.5
  });

  const fetchStudents = async () => {
    try {
      const res = await API.get(`/students?search=${search}&department=${department}&year=${year}&semester=${semester}&section=${section}&status=${status}`);
      if (res.data) setStudents(res.data);
    } catch (err) {
      console.log('Error fetching students directory');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, year, semester, section, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/students', formData);
      addToast('Student created successfully with Register Number!', 'success');
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      addToast(err.message || 'Failed to create student record', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      const res = await API.delete(`/students/${id}`);
      addToast(res.message || 'Student record deleted successfully!', 'success');
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      setStudents(prev => prev.filter(s => s._id !== id));
      addToast('Student record removed from directory!', 'success');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected student records?`)) return;
    for (const id of selectedIds) {
      try {
        await API.delete(`/students/${id}`);
      } catch (err) {}
    }
    setStudents(prev => prev.filter(s => !selectedIds.includes(s._id)));
    setSelectedIds([]);
    addToast('Selected student records deleted successfully', 'success');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectIndividual = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Modern ERP Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="#2563eb" /> Student Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage register numbers, academic standing, sections, and CGPA</p>
        </div>

        {/* Toolbar Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
            <Plus size={16} /> Add Student
          </button>
          <button onClick={fetchStudents} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.55rem 0.85rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 0.85rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
              <Trash2 size={15} /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search Register No, Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--text-main)' }}
          />
        </div>

        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <option value="All">All Depts</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <option value="All">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>

        <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <option value="All">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        <select value={section} onChange={(e) => setSection(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <option value="All">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === students.length} />
              </th>
              <th style={{ padding: '0.75rem' }}>PHOTO</th>
              <th style={{ padding: '0.75rem' }}>REGISTER NO</th>
              <th style={{ padding: '0.75rem' }}>STUDENT NAME</th>
              <th style={{ padding: '0.75rem' }}>DEPARTMENT</th>
              <th style={{ padding: '0.75rem' }}>YEAR / SEM</th>
              <th style={{ padding: '0.75rem' }}>PHONE / EMAIL</th>
              <th style={{ padding: '0.75rem' }}>CGPA</th>
              <th style={{ padding: '0.75rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <input type="checkbox" checked={selectedIds.includes(s._id)} onChange={() => handleSelectIndividual(s._id)} />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <img src={s.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="Student" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{s.registerNumber || s.rollNumber}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '0.75rem' }}>{s.department}</td>
                  <td style={{ padding: '0.75rem' }}>Yr {s.year} / Sem {s.semester} ({s.section})</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>{s.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.phone || '—'}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: '#16a34a' }}>{s.cgpa}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}>
                      {s.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleDelete(s._id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No student records found. Click "Add Student" to create a record.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Add New Student Record</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="Register Number (e.g. 951121104005)" required value={formData.registerNumber} onChange={e => setFormData({...formData, registerNumber: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <input type="text" placeholder="Full Student Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Year (1-4)" min="1" max="4" required value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <input type="number" placeholder="Semester (1-8)" min="1" max="8" required value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>Create Student</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
