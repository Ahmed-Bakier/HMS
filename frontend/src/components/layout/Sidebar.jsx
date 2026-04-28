import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const allNavItems = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard',    roles: ['super_admin','admin','doctor','nurse','receptionist','pharmacist','billing_clerk'] },
  { to: '/doctors',      icon: '🩺', label: 'Doctors',      roles: ['super_admin','admin','doctor','nurse','receptionist'] },
  { to: '/patients',     icon: '🏥', label: 'Patients',     roles: ['super_admin','admin','doctor','nurse'] },
  { to: '/appointments', icon: '📅', label: 'Appointments', roles: ['super_admin','admin','doctor','nurse','receptionist'] },
  { to: '/pharmacy',     icon: '💊', label: 'Pharmacy',     roles: ['super_admin','admin','pharmacist'] },
  { to: '/billing',      icon: '💰', label: 'Billing',      roles: ['super_admin','admin','billing_clerk'] },
  { to: '/users',        icon: '👥', label: 'Users',        roles: ['super_admin','admin'] },
  { to: '/settings',     icon: '⚙️', label: 'Settings',     roles: ['super_admin','admin','doctor','nurse','receptionist','pharmacist','billing_clerk'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <div>
            <p className="text-white font-semibold text-sm">MediCore</p>
            <p className="text-slate-400 text-xs">HMS v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-slate-400 text-xs capitalize">{user?.role?.replace('_',' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full text-left text-slate-400 hover:text-white text-xs px-2 py-1.5 rounded hover:bg-slate-800 transition">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
