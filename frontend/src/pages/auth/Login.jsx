import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import { Lock, UserCheck, ShieldCheck, GraduationCap, ArrowRight, KeyRound, Check } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('Student'); // Student | Faculty | Admin
  const [identifier, setIdentifier] = useState('951121104001');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);

  // Force Password Change State
  const [mustChange, setMustChange] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Student') {
      setIdentifier('951121104001');
      setPassword('student123');
    } else if (tab === 'Faculty') {
      setIdentifier('JPC-FAC-101');
      setPassword('faculty123');
    } else if (tab === 'Admin') {
      setIdentifier('admin@jpcollege.edu');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);

    if (result.mustChangePassword) {
      setMustChange(true);
      setPendingUser(result.user);
      addToast('First login detected! Please set a new password.', 'info');
      return;
    }

    if (result.success) {
      addToast(`Welcome back to JPC Portal! Logged in as ${activeTab}`, 'success');
      if (activeTab === 'Student') {
        navigate('/student/dashboard');
      } else if (activeTab === 'Faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      addToast(result.message || 'Authentication failed', 'error');
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match!', 'error');
      return;
    }

    try {
      await API.post('/auth/change-password', {
        identifier: pendingUser?.registerNumber || pendingUser?.facultyId || identifier,
        newPassword
      });
      addToast('Password changed successfully! Signing into portal...', 'success');
      setMustChange(false);
      
      // Auto login with new password
      const res = await login(identifier, newPassword);
      if (res.success) {
        if (activeTab === 'Student') navigate('/student/dashboard');
        else if (activeTab === 'Faculty') navigate('/faculty/dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      addToast('Password updated successfully! Sign in with your new password.', 'success');
      setMustChange(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)', padding: '1.5rem' }}>
      
      {!mustChange ? (
        <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.6rem', margin: '0 auto 1rem', boxShadow: '0 10px 25px rgba(29, 78, 216, 0.4)' }}>
              JPC
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              J.P. COLLEGE OF ENGINEERING
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Anna University Engineering College ERP Portal
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
            {[
              { id: 'Student', label: 'Student', icon: GraduationCap },
              { id: 'Faculty', label: 'Faculty', icon: UserCheck },
              { id: 'Admin', label: 'Admin', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.55rem',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#ffffff' : '#64748b',
                    background: isActive ? '#1d4ed8' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {activeTab === 'Student' ? 'REGISTER NUMBER' : activeTab === 'Faculty' ? 'FACULTY ID' : 'OFFICIAL EMAIL'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '12px', background: '#f8fafc' }}>
                {activeTab === 'Student' ? <GraduationCap size={18} color="#1d4ed8" /> : activeTab === 'Faculty' ? <UserCheck size={18} color="#1d4ed8" /> : <ShieldCheck size={18} color="#1d4ed8" />}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={activeTab === 'Student' ? 'e.g. 951121104001' : activeTab === 'Faculty' ? 'e.g. JPC-FAC-101' : 'admin@jpcollege.edu'}
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                PASSWORD {activeTab === 'Faculty' && <span style={{ color: '#64748b', fontWeight: 500 }}>(Default: faculty123)</span>} {activeTab === 'Student' && <span style={{ color: '#64748b', fontWeight: 500 }}>(Default: Register Number)</span>}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '12px', background: '#f8fafc' }}>
                <Lock size={18} color="#64748b" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 8px 20px rgba(29,78,216,0.35)'
              }}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${activeTab}`}</span>
              <ArrowRight size={18} />
            </button>
          </form>

        </div>
      ) : (
        /* Force Password Change Card */
        <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.98)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <KeyRound size={28} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Mandatory Password Update
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              First login detected for {pendingUser?.name || identifier}. Please create a secure password to protect your portal account.
            </p>
          </div>

          <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>NEW PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.85rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 8px 20px rgba(22,163,74,0.35)' }}
            >
              <Check size={18} />
              <span>Update Password & Continue</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Login;
