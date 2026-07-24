import React from 'react';
import Header from '../components/layout/Header';
import TopNav from '../components/layout/TopNav';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Header />
      <TopNav />
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} J.P. College of Engineering - Department Management & ERP System | Deployed with MongoDB Atlas & Vercel
      </footer>
    </div>
  );
};

export default MainLayout;
