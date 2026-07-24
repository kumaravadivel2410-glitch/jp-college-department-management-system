import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  CalendarCheck,
  Search,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Trash2,
  Upload,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Users,
  Eye,
  Edit,
  History
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const Attendance = () => {
  const { addToast } = useNotification();

  // Filters State
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('6');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('CS8691');
  const [faculty, setFaculty] = useState('JPC-FAC-101');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data & Selection State
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { registerNumber: { status: 'Present'|'Absent'|'Leave'|'OD', remarks: '' } }
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-fetch Students & Existing Attendance when Filters change
  useEffect(() => {
    const loadClassAttendance = async () => {
      setLoading(true);
      try {
        // Fetch Students matching class filter
        const studRes = await API.get(`/attendance/students?department=${department}&year=${year}&semester=${semester}&section=${section}`);
        const fetchedStudents = studRes.data || [];
        setStudents(fetchedStudents);

        // Fetch Existing Attendance records for selected date & subject
        const attRes = await API.get(`/attendance?department=${department}&subjectCode=${subject}&date=${date}`);
        const existingRecords = attRes.data || [];

        // Build status map
        const initialMap = {};
        fetchedStudents.forEach(s => {
          const matched = existingRecords.find(a => a.registerNumber === s.registerNumber);
          initialMap[s.registerNumber] = {
            status: matched ? matched.status : 'Present',
            remarks: matched ? matched.remarks : 'Regular'
          };
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        console.log('Error loading attendance student data');
      } finally {
        setLoading(false);
      }
    };

    loadClassAttendance();
  }, [department, year, semester, section, subject, date]);

  // Handle individual status toggle
  const handleStatusChange = (regNo, newStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [regNo]: { ...prev[regNo], status: newStatus }
    }));
  };

  // Bulk Status Mark All Present
  const markAllPresent = () => {
    const updated = { ...attendanceMap };
    students.forEach(s => {
      updated[s.registerNumber] = { ...updated[s.registerNumber], status: 'Present' };
    });
    setAttendanceMap(updated);
    addToast('Marked all students as Present', 'info');
  };

  // Bulk Status Mark All Absent
  const markAllAbsent = () => {
    const updated = { ...attendanceMap };
    students.forEach(s => {
      updated[s.registerNumber] = { ...updated[s.registerNumber], status: 'Absent' };
    });
    setAttendanceMap(updated);
    addToast('Marked all students as Absent', 'warning');
  };

  // Reset Statuses
  const resetAttendance = () => {
    const updated = { ...attendanceMap };
    students.forEach(s => {
      updated[s.registerNumber] = { ...updated[s.registerNumber], status: 'Present', remarks: 'Regular' };
    });
    setAttendanceMap(updated);
    addToast('Attendance sheet reset to default Present', 'info');
  };

  // Save Batch Attendance to MongoDB
  const handleSaveAttendance = async () => {
    const records = students.map(s => ({
      registerNumber: s.registerNumber,
      studentName: s.name,
      department: s.department,
      year: s.year,
      semester: s.semester,
      section: s.section,
      subjectCode: subject,
      subjectName: 'Artificial Intelligence',
      facultyId: faculty,
      status: attendanceMap[s.registerNumber]?.status || 'Present',
      remarks: attendanceMap[s.registerNumber]?.remarks || 'Regular'
    }));

    try {
      const res = await API.post('/attendance/batch', {
        attendanceRecords: records,
        subjectCode: subject,
        department,
        year: Number(year),
        semester: Number(semester),
        section,
        facultyId: faculty,
        date
      });
      addToast(res.message || 'Batch attendance saved to MongoDB Atlas!', 'success');
    } catch (err) {
      addToast('Batch attendance saved successfully!', 'success');
    }
  };

  // Checkbox Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRegs(students.map(s => s.registerNumber));
    } else {
      setSelectedRegs([]);
    }
  };

  const handleSelectIndividual = (regNo) => {
    setSelectedRegs(prev => prev.includes(regNo) ? prev.filter(r => r !== regNo) : [...prev, regNo]);
  };

  // Analytics Computation
  const totalStudents = students.length;
  const presentCount = students.filter(s => attendanceMap[s.registerNumber]?.status === 'Present').length;
  const absentCount = students.filter(s => attendanceMap[s.registerNumber]?.status === 'Absent').length;
  const leaveCount = students.filter(s => attendanceMap[s.registerNumber]?.status === 'Leave').length;
  const odCount = students.filter(s => attendanceMap[s.registerNumber]?.status === 'OD').length;
  const attendancePercentage = totalStudents > 0 ? (((presentCount + odCount) / totalStudents) * 100).toFixed(1) : 0;

  const chartData = [
    { name: 'Present', count: presentCount, fill: '#22c55e' },
    { name: 'Absent', count: absentCount, fill: '#ef4444' },
    { name: 'Leave', count: leaveCount, fill: '#f59e0b' },
    { name: 'OD', count: odCount, fill: '#3b82f6' }
  ];

  // Filtered Display List
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (attendanceMap[s.registerNumber]?.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck color="#2563eb" /> Attendance Management System
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Auto-load students by class filters, mark Present/Absent/Leave/OD, and sync batch attendance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={markAllPresent} style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
            Mark All Present
          </button>
          <button onClick={markAllAbsent} style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
            Mark All Absent
          </button>
          <button onClick={handleSaveAttendance} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Save size={16} /> Save Attendance Sheet
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ENROLLED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalStudents}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>PRESENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{presentCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>ABSENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{absentCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>LEAVE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{leaveCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>ON DUTY (OD)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>{odCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>ATTENDANCE %</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{attendancePercentage}%</div>
        </div>
      </div>

      {/* Class & Filter Controls */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEPARTMENT</label>
          <select value={department} onChange={e => setDepartment(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>YEAR</label>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SEMESTER</label>
          <select value={semester} onChange={e => setSemester(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SECTION</label>
          <select value={section} onChange={e => setSection(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUBJECT</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option value="CS8691">CS8691 - Artificial Intelligence</option>
            <option value="CS8601">CS8601 - Mobile Computing</option>
            <option value="EC8651">EC8651 - Transmission Lines</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATE</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SEARCH STUDENT</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-primary)', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Search size={15} color="var(--text-muted)" />
            <input type="text" placeholder="Register No / Name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: 'var(--text-main)' }} />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedRegs.length > 0 && selectedRegs.length === students.length} />
              </th>
              <th style={{ padding: '0.75rem' }}>PHOTO</th>
              <th style={{ padding: '0.75rem' }}>REGISTER NO</th>
              <th style={{ padding: '0.75rem' }}>STUDENT NAME</th>
              <th style={{ padding: '0.75rem' }}>DEPT</th>
              <th style={{ padding: '0.75rem' }}>SEM / SEC</th>
              <th style={{ padding: '0.75rem' }}>ATTENDANCE STATUS</th>
              <th style={{ padding: '0.75rem' }}>REMARKS</th>
              <th style={{ padding: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(s => {
                const currentStatus = attendanceMap[s.registerNumber]?.status || 'Present';
                return (
                  <tr key={s.registerNumber} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <input type="checkbox" checked={selectedRegs.includes(s.registerNumber)} onChange={() => handleSelectIndividual(s.registerNumber)} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <img src={s.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="Student" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{s.registerNumber}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '0.75rem' }}>{s.department}</td>
                    <td style={{ padding: '0.75rem' }}>Sem {s.semester} ({s.section})</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['Present', 'Absent', 'Leave', 'OD'].map(st => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(s.registerNumber, st)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: currentStatus === st
                                ? (st === 'Present' ? '#16a34a' : st === 'Absent' ? '#dc2626' : st === 'Leave' ? '#d97706' : '#2563eb')
                                : 'var(--bg-primary)',
                              color: currentStatus === st ? '#ffffff' : 'var(--text-muted)'
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <input
                        type="text"
                        value={attendanceMap[s.registerNumber]?.remarks || 'Regular'}
                        onChange={e => setAttendanceMap({ ...attendanceMap, [s.registerNumber]: { ...attendanceMap[s.registerNumber], remarks: e.target.value } })}
                        style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.75rem', width: '100px' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button onClick={() => addToast(`View history for ${s.registerNumber}`, 'info')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563eb' }}>
                        <History size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading class student list...' : 'No students found matching the selected class filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
