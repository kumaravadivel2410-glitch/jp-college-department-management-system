import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertTriangle size={32} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
        The requested ERP page or module route does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}
      >
        <Home size={18} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
