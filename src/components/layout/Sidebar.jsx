import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, Settings, ShieldAlert, Briefcase, Calendar, UsersRound, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const ROLES = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: ShieldAlert, label: 'System Logs', path: '/systemlogs' },
  ],
  MANAGER: [
    { icon: UsersRound, label: 'My Team', path: '/myteam' },
    { icon: Calendar, label: 'Interviews', path: '/interviews' },
  ],
  EMPLOYEE: [
    { icon: UserCircle, label: 'My Profile', path: '/profile' },
  ],
  CANDIDATE: [
    { icon: Briefcase, label: 'My Application', path: '/candidate-dashboard' },
  ]
};

export default function Sidebar() {
  const { user, logout, getRole } = useAuth();
  const navigate = useNavigate();
  const activeRole = getRole() || 'EMPLOYEE';
  const navItems = ROLES[activeRole] || ROLES.EMPLOYEE;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-surface-container-low transition-colors pb-6 flex flex-col items-stretch">
      <div className="py-8 px-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-lg">P</div>
        <span className="font-semibold text-lg tracking-tight text-on-surface">Precision</span>
      </div>
      
      <div className="px-4 flex-1">
        <div className="text-[0.65rem] uppercase tracking-wider text-on-surface-variant font-semibold mb-4 px-2">
          {activeRole} NAVIGATION
        </div>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-surface-container-highest text-primary font-medium" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User info + Logout */}
      <div className="px-4 mt-auto">
        {user && (
          <div className="bg-surface-container rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-on-surface truncate">{user.name}</div>
                <div className="text-[0.65rem] text-on-surface-variant truncate">{activeRole}</div>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-on-surface-variant hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
