import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header  from './Header';

const titles = {
  '/dashboard':    'Dashboard',
  '/doctors':      'Doctors',
  '/patients':     'Patients',
  '/appointments': 'Appointments',
  '/pharmacy':     'Pharmacy',
  '/billing':      'Billing',
  '/users':        'Users',
  '/settings':     'Settings',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'MediCore';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
