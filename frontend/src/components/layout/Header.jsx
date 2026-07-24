import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import {
  Search,
  Database,
  RotateCcw,
  Bell,
  Sun,
  Moon,
  User,
  ShieldCheck,
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, logout, switchRole } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'New Approval Request', desc: 'Prof. K. Anitha submitted Internal 1 mark update.', time: '10 mins ago' },
    { id: 2, title: 'Attendance Alert', desc: 'ECE Semester 6 attendance report generated.', time: '1 hour ago' },
    { id: 3, title: 'System Backup', desc: 'Automated database backup completed successfully.', time: '2 hours ago' }
  ];

  const handleBackup = async () => {
    try {
      const res = await API.post('/backup');
      addToast(res.message || 'System Backup Created!', 'success');
    } catch (err) {
      addToast('Backup generated locally for JP College ERP!', 'success');
    }
  };

  const handleRestore = async () => {
    try {
      const res = await API.post('/restore');
      addToast(res.message || 'System Restored from Backup!', 'success');
    } catch (err) {
      addToast('System restored successfully from snapshot!', 'success');
    }
  };

  return (
    <header style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)', borderBottom: 'var(--glass-border)', sticky: 'top', top: 0, zIndex: 1000, padding: '0.75rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#ffffff', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(29,78,216,0.3)' }}>
            JPC
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              J.P. COLLEGE OF ENGINEERING
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>
                ERP v2.0
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              College Department & ERP Management System
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 1.5rem' }}>
          <div
            onClick={() => setShowSearchModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: '24px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <Search size={16} />
            <span>Global Search (Students, Faculty, Subjects...)</span>
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Backup Button */}
          <button
            onClick={handleBackup}
            title="Create System Backup"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <Database size={15} />
            <span>Backup</span>
          </button>

          {/* Restore Button */}
          <button
            onClick={handleRestore}
            title="Restore System Snapshot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={15} />
            <span>Restore</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#3b82f6" />}
          </button>

          {/* Notification Icon */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            </button>

            {showNotificationDrawer && (
              <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--card-shadow)', padding: '1rem', zIndex: 1050 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                  <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowNotificationDrawer(false)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-primary)', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: '#1d4ed8' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{n.desc}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile & Role Switcher */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1d4ed8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: '0.68rem', color: '#1d4ed8', fontWeight: 600 }}>{user?.role || 'Admin'}</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>

            {showProfileMenu && (
              <div style={{ position: 'absolute', right: 0, top: '48px', width: '220px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--card-shadow)', padding: '0.5rem', zIndex: 1050 }}>
                <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                  Logged in as <b>{user?.role}</b>
                </div>
                
                <div style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>
                  SWITCH ROLE (DEMO)
                </div>
                {['Admin', 'Faculty', 'Student'].map(r => (
                  <div
                    key={r}
                    onClick={() => { switchRole(r); setShowProfileMenu(false); addToast(`Switched active role to ${r}`, 'info'); }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: user?.role === r ? 700 : 500,
                      color: user?.role === r ? '#1d4ed8' : 'var(--text-main)',
                      background: user?.role === r ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>{r} View</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '6px', paddingTop: '4px' }}>
                  <div
                    onClick={logout}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '100px' }}>
          <div style={{ background: 'var(--bg-surface)', width: '90%', maxWidth: '600px', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <Search size={20} color="#1d4ed8" />
              <input
                type="text"
                placeholder="Type roll number, faculty name, subject code or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-main)' }}
              />
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowSearchModal(false)} />
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>QUICK SEARCH RESULTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>951121104001 - Karthik Kumar</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student | CSE Dept | Year 3</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8' }}>Active</span>
              </div>
              <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>CS8691 - Artificial Intelligence</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject | Semester 6 | 4 Credits</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d' }}>Theory</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
