import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  UserCheck,
  Bell,
  Mail,
  Phone,
  Edit,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const DepartmentHomePage = () => {
  const { deptCode: urlDept } = useParams();
  const { user } = useAuth();
  const activeDept = (urlDept || user?.department || 'CSE').toUpperCase();

  const [deptData, setDeptData] = useState({
    departmentCode: activeDept,
    departmentName: activeDept === 'CSE' ? 'Computer Science & Engineering' :
                    activeDept === 'ECE' ? 'Electronics & Communication Engineering' :
                    activeDept === 'EEE' ? 'Electrical & Electronics Engineering' :
                    activeDept === 'MECH' ? 'Mechanical Engineering' :
                    activeDept === 'CIVIL' ? 'Civil Engineering' :
                    'Artificial Intelligence & Data Science',
    bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80',
    aboutText: 'The Department is committed to providing world-class Anna University engineering education with state-of-the-art laboratory infrastructure, industry-supported projects, and top campus placements.',
    vision: 'To emerge as a center of excellence in engineering education, research, and technical innovation.',
    mission: [
      'M1: Deliver quality technical education adhering to Anna University curriculum.',
      'M2: Establish strong industry partnerships for hands-on internships and research.',
      'M3: Nurture ethical values, professional leadership, and lifelong technical learning.'
    ],
    peos: [
      'PEO1: Graduates will excel in software development, core engineering, and analytical research.',
      'PEO2: Graduates will design sustainable technical solutions to societal challenges.',
      'PEO3: Graduates will demonstrate ethical leadership and effective multidisciplinary teamwork.'
    ],
    pos: [
      'PO1: Apply knowledge of mathematics, science, and engineering fundamentals.',
      'PO2: Identify, formulate, and analyze complex engineering problems.',
      'PO3: Design and implement component or process solutions.'
    ],
    psos: [
      'PSO1: Ability to apply modern domain tools and AI frameworks.',
      'PSO2: Development of enterprise-grade industrial software and hardware systems.'
    ],
    hodName: 'Dr. M. Sundaram, Ph.D.',
    hodMessage: 'Welcome to our Department. We focus on academic excellence, hands-on laboratory experiments, and 100% placement assistance.',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    achievements: [
      '100% Pass Percentage in Anna University Semester Exams 2025.',
      '5 Student Projects Funded by Tamil Nadu Startup Mission.',
      '1st Rank in Smart India Hackathon Grand Finale.'
    ],
    placements: [
      { company: 'TCS Digital', count: 18, package: '7.5 LPA' },
      { company: 'Zoho Corporation', count: 12, package: '8.4 LPA' },
      { company: 'Infosys Power Programmer', count: 15, package: '9.0 LPA' }
    ],
    laboratories: [
      { name: 'Advanced Computing & AI Lab', equipment: '30 High-Performance GPU Workstations' },
      { name: 'IoT & Embedded Systems Lab', equipment: 'Cadence Design Suite, ARM Microcontrollers' }
    ],
    notices: [
      { title: 'Anna University End-Semester Examination Schedule Announced', date: '2026-07-20' },
      { title: 'Zoho Campus Recruitment Drive for Final Year Students', date: '2026-07-22' }
    ],
    contactEmail: 'hod@jpcollege.edu',
    contactPhone: '+91 98765 43210'
  });

  const isHOD = user?.role === 'Admin' || (user?.role === 'Faculty' && user?.department === activeDept);

  useEffect(() => {
    const fetchDeptHome = async () => {
      try {
        const res = await API.get(`/department-home/${activeDept}`);
        if (res.data) setDeptData(res.data);
      } catch (err) {
        console.log('Using default department home content');
      }
    };
    fetchDeptHome();
  }, [activeDept]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1440px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Department Banner Header */}
      <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <img src={deptData.bannerUrl} alt="Department Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ padding: '4px 12px', background: '#3b82f6', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                ANNA UNIVERSITY AFFILIATED
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.02em' }}>
                Department of {deptData.departmentName} ({deptData.departmentCode})
              </h1>
              <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '800px', marginTop: '4px' }}>
                {deptData.aboutText}
              </p>
            </div>

            {isHOD && (
              <Link
                to={`/department-cms/${activeDept}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', color: '#1d4ed8', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
              >
                <Edit size={16} /> Edit Department Home (HOD CMS)
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(59,130,246,0.01))' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#1d4ed8" /> Department Vision
          </h3>
          <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
            {deptData.vision}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#16a34a" /> Department Mission
          </h3>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {deptData.mission.map((m, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* HOD Message & Objectives */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* HOD Message Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <img src={deptData.hodPhotoUrl} alt="HOD" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }} />
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{deptData.hodName}</h4>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, marginBottom: '6px' }}>Head of Department ({deptData.departmentCode})</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{deptData.hodMessage}"
            </p>
          </div>
        </div>

        {/* PEOs / POs Objectives */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#9333ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#9333ea" /> Programme Educational Objectives (PEOs)
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {deptData.peos.map((peo, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{peo}</li>
            ))}
          </ul>
        </div>

      </div>

      {/* Placements & Achievements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="#2563eb" /> Recent Campus Placements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deptData.placements.map((plc, idx) => (
              <div key={idx} style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{plc.company}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offers: <b>{plc.count} Students</b></div>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', padding: '4px 10px', background: '#dcfce7', borderRadius: '8px' }}>{plc.package}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ea580c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#ea580c" /> Department Achievements
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            {deptData.achievements.map((ach, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{ach}</li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};

export default DepartmentHomePage;
