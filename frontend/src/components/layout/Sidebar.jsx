import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  UserSquare2,
  Building2,
  BookOpen,
  DoorOpen,
  CalendarCheck,
  FileSignature,
  GraduationCap,
  FileText,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Download,
  History,
  Settings,
  Info,
  Brain,
  Sparkles,
  TrendingUp,
  Cpu,
  FileSpreadsheet
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isFaculty = role === 'faculty';

  const erpNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Approvals', path: '/approvals', icon: UserCheck, roles: ['admin', 'super_admin'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['admin', 'super_admin', 'faculty'] },
    { name: 'Faculty', path: '/faculty', icon: UserSquare2, roles: ['admin', 'super_admin', 'faculty'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'super_admin'] },
    { name: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['admin', 'super_admin', 'faculty'] },
    { name: 'Classes', path: '/classes', icon: DoorOpen, roles: ['admin', 'super_admin', 'faculty'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Internal Marks', path: '/internal-marks', icon: FileSignature, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Semester Marks', path: '/semester-marks', icon: GraduationCap, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Subject Notes', path: '/subject-notes', icon: FileText, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Assignments', path: '/assignments', icon: CheckSquare, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Timetable', path: '/timetable', icon: CalendarDays, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'super_admin', 'faculty'] },
    { name: 'Downloads', path: '/downloads', icon: Download, roles: ['admin', 'super_admin', 'faculty', 'student'] },
    { name: 'History', path: '/history', icon: History, roles: ['admin', 'super_admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'super_admin'] },
    { name: 'About', path: '/about', icon: Info, roles: ['admin', 'super_admin', 'faculty', 'student'] }
  ];

  const aiNavItems = [
    { name: 'AI Dashboard', path: '/ai-dashboard', icon: Sparkles },
    { name: 'Student Prediction', path: '/ai-predictions', icon: Brain },
    { name: 'Attendance Prediction', path: '/ai-attendance-predictions', icon: CalendarCheck },
    { name: 'Performance Analytics', path: '/ai-analytics', icon: TrendingUp },
    { name: 'Model Management', path: '/ai-models', icon: Cpu },
    { name: 'AI Reports', path: '/ai-reports', icon: FileSpreadsheet }
  ];

  const filteredErpItems = erpNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl z-20 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
          JPC
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 leading-tight">J.P. COLLEGE</h1>
          <p className="text-xs text-blue-400 font-medium">ERP & AI Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core ERP Section */}
        <div>
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Core Modules
          </div>
          <nav className="space-y-1">
            {filteredErpItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI & ML Module Section */}
        <div>
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>AI & ML Module</span>
          </div>
          <nav className="space-y-1">
            {aiNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="truncate">
            <p className="font-semibold text-slate-200 truncate">{user?.name || 'ERP User'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
