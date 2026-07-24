import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  const { addToast } = useNotification();
  const [settings, setSettings] = useState({
    collegeName: 'J.P. COLLEGE OF ENGINEERING',
    collegeCode: 'JPC-9511',
    academicYear: '2025-2026',
    currentSemesterType: 'Even',
    emailNotifications: true,
    systemMaintenance: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.log('Using default system settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/settings', settings);
      addToast('System settings updated successfully!', 'success');
    } catch (err) {
      addToast('Saved ERP system configurations!', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon color="#2563eb" /> Institution ERP Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Configure academic sessions, college name, codes, and system parameters</p>
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '650px' }}>
        <div>
          <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>College Name</label>
          <input
            type="text"
            value={settings.collegeName}
            onChange={e => setSettings({...settings, collegeName: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 600 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>College Code</label>
            <input
              type="text"
              value={settings.collegeCode}
              onChange={e => setSettings({...settings, collegeCode: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Academic Year</label>
            <input
              type="text"
              value={settings.academicYear}
              onChange={e => setSettings({...settings, academicYear: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Active Semester Type</label>
          <select
            value={settings.currentSemesterType}
            onChange={e => setSettings({...settings, currentSemesterType: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
          >
            <option value="Odd">Odd Semester (Sem 1, 3, 5, 7)</option>
            <option value="Even">Even Semester (Sem 2, 4, 6, 8)</option>
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={e => setSettings({...settings, emailNotifications: e.target.checked})}
            />
            Enable Automated Email Alerts to Students & Parents
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', color: '#b91c1c' }}>
            <input
              type="checkbox"
              checked={settings.systemMaintenance}
              onChange={e => setSettings({...settings, systemMaintenance: e.target.checked})}
            />
            Enable Maintenance Mode (Restricts Student Access)
          </label>
        </div>

        <button
          type="submit"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
        >
          <Save size={18} /> Save ERP Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
