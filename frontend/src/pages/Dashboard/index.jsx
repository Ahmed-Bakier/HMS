import { useEffect, useState } from 'react';
import api from '../../api/axios';

const KPICard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Patients"   value={stats?.total_patients}   icon="🏥" color="text-blue-600" />
        <KPICard label="Available Beds"   value={stats?.available_beds}   icon="🛏️" color="text-emerald-600" />
        <KPICard label="Doctors On Duty"  value={stats?.doctors_on_duty}  icon="🩺" color="text-violet-600" />
        <KPICard label="Revenue Today"    value={`$${stats?.revenue_today}`} icon="💰" color="text-amber-600" />
        <KPICard label="Admissions Today" value={stats?.admissions_today} icon="📋" color="text-blue-600" />
        <KPICard label="Critical Patients"value={stats?.critical_patients}icon="⚠️" color="text-red-600" />
        <KPICard label="Pending Invoices" value={stats?.pending_invoices} icon="📄" color="text-amber-600" />
        <KPICard label="Discharges Today" value={stats?.discharges_today} icon="✅" color="text-emerald-600" />
      </div>
    </div>
  );
}
