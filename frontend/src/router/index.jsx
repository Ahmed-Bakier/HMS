import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout       from '../components/layout/Layout';
import Login        from '../pages/Auth/Login';
import Dashboard    from '../pages/Dashboard';
import Doctors      from '../pages/Doctors';
import Patients     from '../pages/Patients';
import Appointments from '../pages/Appointments';
import Pharmacy     from '../pages/Pharmacy';
import Billing      from '../pages/Billing';
import Users        from '../pages/Users';
import Settings     from '../pages/Settings';

const ROLES = {
  dashboard:    ['super_admin','admin','doctor','nurse','receptionist','pharmacist','billing_clerk'],
  doctors:      ['super_admin','admin','doctor','nurse','receptionist'],
  patients:     ['super_admin','admin','doctor','nurse'],
  appointments: ['super_admin','admin','doctor','nurse','receptionist'],
  pharmacy:     ['super_admin','admin','pharmacist'],
  billing:      ['super_admin','admin','billing_clerk'],
  users:        ['super_admin','admin'],
  settings:     ['super_admin','admin','doctor','nurse','receptionist','pharmacist','billing_clerk'],
};

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore(s => s.user);
  return user ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ page, children }) => {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!ROLES[page]?.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<RoleRoute page="dashboard"><Dashboard /></RoleRoute>} />
          <Route path="doctors"      element={<RoleRoute page="doctors"><Doctors /></RoleRoute>} />
          <Route path="patients"     element={<RoleRoute page="patients"><Patients /></RoleRoute>} />
          <Route path="appointments" element={<RoleRoute page="appointments"><Appointments /></RoleRoute>} />
          <Route path="pharmacy"     element={<RoleRoute page="pharmacy"><Pharmacy /></RoleRoute>} />
          <Route path="billing"      element={<RoleRoute page="billing"><Billing /></RoleRoute>} />
          <Route path="users"        element={<RoleRoute page="users"><Users /></RoleRoute>} />
          <Route path="settings"     element={<RoleRoute page="settings"><Settings /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
