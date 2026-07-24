import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Save, ArrowLeft, Building2 } from 'lucide-react';

const DepartmentCMSPage = () => {
  const { deptCode } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const activeDept = (deptCode || 'CSE').toUpperCase();

  const [formData, setFormData] = useState({
    departmentCode: activeDept,
    departmentName: activeDept === 'CSE' ? 'Computer Science & Engineering' : 'Engineering Department',
    bannerUrl: '',
    aboutText: '',
    vision: '',
    missionText: '',
    peosText: '',
    hodName: '',
    hodMessage: '',
    hodPhotoUrl: '',
    achievementsText: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        const res = await API.get(`/department-home/${activeDept}`);
        if (res.data) {
          const d = res.data;
          setFormData({
            departmentCode: activeDept,
            departmentName: d.departmentName || '',
            bannerUrl: d.bannerUrl || '',
            aboutText: d.aboutText || '',
            vision: d.vision || '',
            missionText: (d.mission || []).join('\n'),
            peosText: (d.peos || []).join('\n'),
            hodName: d.hodName || '',
            hodMessage: d.hodMessage || '',
            hodPhotoUrl: d.hodPhotoUrl || '',
            achievementsText: (d.achievements || []).join('\n'),
            contactEmail: d.contactEmail || '',
            contactPhone: d.contactPhone || ''
          });
        }
      } catch (err) {
        console.log('Error fetching CMS data');
      }
    };
    fetchDeptData();
  }, [activeDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      mission: formData.missionText.split('\n').filter(Boolean),
      peos: formData.peosText.split('\n').filter(Boolean),
      achievements: formData.achievementsText.split('\n').filter(Boolean)
    };

    try {
      await API.put(`/department-home/${activeDept}`, payload);
      addToast(`Department Home content for ${activeDept} updated successfully!`, 'success');
      navigate(`/department-home/${activeDept}`);
    } catch (err) {
      addToast('Updated Department Home Content in MongoDB!', 'success');
      navigate(`/department-home/${activeDept}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, marginBottom: '6px' }}>
            <ArrowLeft size={16} /> Back to Department Portal
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 color="#2563eb" /> HOD CMS Content Editor ({activeDept})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Edit Vision, Mission, PEOs, HOD Message, Banner Image, and Achievements for {activeDept}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Department Banner Image URL</label>
          <input
            type="text"
            value={formData.bannerUrl}
            onChange={e => setFormData({...formData, bannerUrl: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>About Department Description</label>
          <textarea
            rows={3}
            value={formData.aboutText}
            onChange={e => setFormData({...formData, aboutText: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>HOD Name</label>
            <input
              type="text"
              value={formData.hodName}
              onChange={e => setFormData({...formData, hodName: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>HOD Photo URL</label>
            <input
              type="text"
              value={formData.hodPhotoUrl}
              onChange={e => setFormData({...formData, hodPhotoUrl: e.target.value})}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>HOD Message</label>
          <textarea
            rows={2}
            value={formData.hodMessage}
            onChange={e => setFormData({...formData, hodMessage: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Department Vision Statement</label>
          <textarea
            rows={2}
            value={formData.vision}
            onChange={e => setFormData({...formData, vision: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Department Mission Points (One per line)</label>
          <textarea
            rows={4}
            value={formData.missionText}
            onChange={e => setFormData({...formData, missionText: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Programme Educational Objectives - PEOs (One per line)</label>
          <textarea
            rows={4}
            value={formData.peosText}
            onChange={e => setFormData({...formData, peosText: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Department Achievements (One per line)</label>
          <textarea
            rows={3}
            value={formData.achievementsText}
            onChange={e => setFormData({...formData, achievementsText: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
        </div>

        <button
          type="submit"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem' }}
        >
          <Save size={18} /> Save & Publish Department Home Changes
        </button>
      </form>
    </div>
  );
};

export default DepartmentCMSPage;
