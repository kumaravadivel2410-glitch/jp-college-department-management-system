import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
