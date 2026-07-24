import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import {
  GraduationCap,
  Award,
  CalendarCheck,
  Download,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Calendar,
  Bell,
  User,
  CheckCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const regNo = user?.registerNumber || '951121104001';

  const [portalData, setPortalData] = useState({
    student: {
      name: user?.name || 'Karthik Kumar',
      registerNumber: regNo,
      department: 'CSE',
      year: 3,
      semester: 6,
      section: 'A',
      cgpa: 8.75,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    attendanceStats: { totalClasses: 45, present: 42, percentage: 93.3 },
    internalMarks: [
      { subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 88, maxMarks: 100 },
      { subjectCode: 'CS8601', subjectName: 'Mobile Computing', examType: 'Internal 1', marksObtained: 92, maxMarks: 100 }
    ],
    semesterMarks: [
      { semester: 5, gpa: 8.80, status: 'Pass', arrearsCount: 0 },
      { semester: 4, gpa: 8.70, status: 'Pass', arrearsCount: 0 }
    ]
  });

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const res = await API.get(`/portal/student/${regNo}`);
        if (res.student) {
          setPortalData(res);
        }
      } catch (err) {
        console.log('Using local student portal data');
      }
    };
    fetchPortal();
  }, [regNo]);

  const handleDownloadHallTicket = () => {
    addToast(`Generating Official Hall Ticket PDF for Reg No: ${regNo}...`, 'success');
  };

  const handleDownloadReportCard = () => {
    addToast(`Generating Semester 6 Official Grade Report Card PDF...`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Profile Summary Header Card */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={portalData.student.photoUrl}
            alt="Student Profile"
            style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #ffffff', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{portalData.student.name}</h1>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Register Number: <b>{portalData.student.registerNumber}</b> | Dept: <b>{portalData.student.department}</b>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>
              Academic Standing: Year {portalData.student.year} / Semester {portalData.student.semester} ({portalData.student.section})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadHallTicket}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', color: '#1d4ed8', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Download size={16} /> Hall Ticket PDF
          </button>
          <button
            onClick={handleDownloadReportCard}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid #ffffff', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Download size={16} /> Report Card PDF
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ATTENDANCE RATE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{portalData.attendanceStats.percentage}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CUMULATIVE CGPA</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{portalData.student.cgpa} / 10</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ENROLLED COURSES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9333ea' }}>6 Subjects</div>
          </div>
        </div>

      </div>

      {/* Internal Marks & Academic Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="#2563eb" size={20} /> Continuous Internal Evaluation
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>SUBJECT</th>
                <th style={{ padding: '0.5rem' }}>EXAM</th>
                <th style={{ padding: '0.5rem' }}>MARKS</th>
              </tr>
            </thead>
            <tbody>
              {portalData.internalMarks.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.6rem', fontWeight: 700 }}>{m.subjectCode} - {m.subjectName}</td>
                  <td style={{ padding: '0.6rem' }}>{m.examType}</td>
                  <td style={{ padding: '0.6rem', fontWeight: 800, color: '#16a34a' }}>{m.marksObtained} / {m.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color="#2563eb" size={20} /> Semester Results History
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>SEMESTER</th>
                <th style={{ padding: '0.5rem' }}>GPA</th>
                <th style={{ padding: '0.5rem' }}>ARREARS</th>
                <th style={{ padding: '0.5rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {portalData.semesterMarks.map((sm, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.6rem', fontWeight: 700 }}>Semester {sm.semester}</td>
                  <td style={{ padding: '0.6rem', fontWeight: 800, color: '#2563eb' }}>{sm.gpa}</td>
                  <td style={{ padding: '0.6rem' }}>{sm.arrearsCount}</td>
                  <td style={{ padding: '0.6rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}>
                      {sm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
