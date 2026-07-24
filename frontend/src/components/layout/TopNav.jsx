import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Edit,
  CheckSquare,
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Award,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Calendar,
  FileUp,
  FileDown,
  PieChart,
  Download,
  History,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TopNav = () => {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const userDept = user?.department || 'CSE';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Dept Home', path: `/department-home/${userDept}`, icon: Building2 },
    { name: 'HOD CMS', path: `/department-cms/${userDept}`, icon: Edit, roles: ['Admin', 'Faculty'] },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Faculty', path: '/faculty', icon: UserCheck },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Classes', path: '/classes', icon: GraduationCap },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Internal Marks', path: '/internal-marks', icon: Award },
    { name: 'Semester Marks', path: '/semester-marks', icon: BarChart3 },
    { name: 'Subject Notes', path: '/subject-notes', icon: FileText },
    { name: 'Assignments', path: '/assignments', icon: FileSpreadsheet },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Import Data', path: '/import-data', icon: FileUp },
    { name: 'Export Data', path: '/export-data', icon: FileDown },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Downloads', path: '/downloads', icon: Download },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'About', path: '/about', icon: Info }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.roles && user?.role && !item.roles.includes(user.role)) return false;
    return true;
  });

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', sticky: 'top', top: '65px', zIndex: 900, padding: '0.4rem 1rem' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', position: 'relative' }}>
        
        <button
          onClick={() => handleScroll('left')}
          style={{ border: 'none', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            whiteSpace: 'nowrap',
            padding: '0.2rem 0.5rem',
            width: '100%'
          }}
        >
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  background: isActive ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                })}
              >
                <Icon size={15} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <button
          onClick={() => handleScroll('right')}
          style={{ border: 'none', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
};

export default TopNav;
