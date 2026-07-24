import React from 'react';
import { Info, ShieldCheck, Database, Server } from 'lucide-react';

const About = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info color="#2563eb" /> About J.P. College of Engineering ERP
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enterprise Academic & Department Management System Overview</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>J.P. College of Engineering</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Approved by AICTE New Delhi and Affiliated to Anna University, Chennai. The Department Management & ERP System powers administrative operations, student directory tracking, attendance analytics, internal and semester examination evaluation, course syllabus notes, and automated reporting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Server size={20} color="#2563eb" style={{ marginBottom: '6px' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vercel Serverless Architecture</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Deployed on Vercel Node serverless functions with automatic API scaling and zero-config deployment.</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Database size={20} color="#16a34a" style={{ marginBottom: '6px' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>MongoDB Atlas Cloud</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cloud document storage using Mongoose validation schemas with automated DB auto-seeding.</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <ShieldCheck size={20} color="#9333ea" style={{ marginBottom: '6px' }} />
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Role-Based Access Control</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>JWT Auth token encryption supporting Admin, Faculty, and Student access levels.</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Version: <b>2.0.0 (Production Release)</b></span>
          <span>College Code: <b>JPC-9511</b></span>
        </div>
      </div>
    </div>
  );
};

export default About;
