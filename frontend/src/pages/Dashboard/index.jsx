import { useEffect, useState } from 'react';
import api from '../../api/axios';

const KPICard = ({ label, value, icon, bg, text, sub }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg}`}>{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${text}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const DAYS = { en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], tr: ['Pzt','Sal','Çar','Per','Cum','Cts','Paz'] };

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [chart, setChart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang]       = useState('en');

  const t = {
    en: {
      title: 'Dashboard', totalPatients: 'Total Patients', availableBeds: 'Available Beds',
      doctorsOnDuty: 'Doctors On Duty', revenueToday: "Revenue Today",
      admissionsToday: 'Admissions Today', criticalPatients: 'Critical Patients',
      pendingInvoices: 'Pending Invoices', dischargesToday: 'Discharges Today',
      weeklyAdmissions: 'Weekly Admissions', todaySummary: "Today's Summary",
      newPatients: 'New Patients', admissions: 'Admissions', discharges: 'Discharges',
      critical: 'Critical', pending: 'Pending Invoices', occupiedBeds: 'Occupied Beds',
      loading: 'Loading dashboard...', ofBeds: 'of',
    },
    tr: {
      title: 'Gösterge Paneli', totalPatients: 'Toplam Hasta', availableBeds: 'Müsait Yatak',
      doctorsOnDuty: 'Görevdeki Doktor', revenueToday: 'Bugünkü Gelir',
      admissionsToday: 'Bugünkü Yatış', criticalPatients: 'Kritik Hasta',
      pendingInvoices: 'Bekleyen Fatura', dischargesToday: 'Bugünkü Taburcu',
      weeklyAdmissions: 'Haftalık Yatışlar', todaySummary: 'Günlük Özet',
      newPatients: 'Yeni Hasta', admissions: 'Yatış', discharges: 'Taburcu',
      critical: 'Kritik', pending: 'Bekleyen Fatura', occupiedBeds: 'Dolu Yatak',
      loading: 'Yükleniyor...', ofBeds: '/',
    },
  }[lang];

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats/'), api.get('/dashboard/admissions/')])
      .then(([s, c]) => { setStats(s.data); setChart(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm animate-pulse">{t.loading}</div>
    </div>
  );

  const maxVal = Math.max(...chart.map(d => d.admissions), 1);

  return (
    <div className="space-y-6">

      {/* Language Toggle */}
      <div className="flex justify-end gap-2">
        {['en','tr'].map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${lang === l ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {l === 'en' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label={t.totalPatients}   value={stats?.total_patients}             icon="🏥" bg="bg-blue-50"    text="text-blue-600"   sub={`+${stats?.new_today} ${lang==='en'?'today':'bugün'}`} />
        <KPICard label={t.availableBeds}   value={stats?.available_beds}             icon="🛏️" bg="bg-emerald-50" text="text-emerald-600" sub={`${stats?.occupied_beds} ${t.ofBeds} ${stats?.total_beds} ${lang==='en'?'occupied':'dolu'}`} />
        <KPICard label={t.doctorsOnDuty}   value={stats?.doctors_on_duty}            icon="🩺" bg="bg-violet-50"  text="text-violet-600" sub={`${lang==='en'?'of':'/'} ${stats?.total_doctors} ${lang==='en'?'total':'toplam'}`} />
        <KPICard label={t.revenueToday}    value={`$${stats?.revenue_today ?? 0}`}   icon="💰" bg="bg-amber-50"   text="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-700">{t.weeklyAdmissions}</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-500">{t.admissions}</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-48">
            {chart.map((d, i) => {
              const pct    = maxVal > 0 ? (d.admissions / maxVal) * 100 : 0;
              const dayIdx = new Date(d.date).getDay();
              const days   = DAYS[lang];
              const dayName = days[dayIdx === 0 ? 6 : dayIdx - 1];
              const isToday = d.date === new Date().toISOString().split('T')[0];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition">
                    {d.admissions}
                  </span>
                  <div className="w-full relative flex items-end" style={{ height: '160px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? 'bg-blue-600' : 'bg-blue-300 hover:bg-blue-400'}`}
                      style={{ height: `${Math.max(pct, d.admissions ? 5 : 1)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                    {dayName}
                  </span>
                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                </div>
              );
            })}
          </div>

          {/* Chart Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? 'Last 7 days' : 'Son 7 gün'}</span>
            <span>{lang === 'en' ? `Total: ${chart.reduce((a,d) => a+d.admissions,0)} admissions` : `Toplam: ${chart.reduce((a,d) => a+d.admissions,0)} yatış`}</span>
          </div>
        </div>

        {/* Today Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t.todaySummary}</h3>
          <div className="space-y-0">
            {[
              { label: t.newPatients,   value: stats?.new_today,         color: 'text-blue-600',    bg: 'bg-blue-50',    icon: '👤' },
              { label: t.admissions,    value: stats?.admissions_today,  color: 'text-violet-600',  bg: 'bg-violet-50',  icon: '📋' },
              { label: t.discharges,    value: stats?.discharges_today,  color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
              { label: t.critical,      value: stats?.critical_patients, color: 'text-red-600',     bg: 'bg-red-50',     icon: '⚠️' },
              { label: t.pending,       value: stats?.pending_invoices,  color: 'text-amber-600',   bg: 'bg-amber-50',   icon: '📄' },
              { label: t.occupiedBeds,  value: `${stats?.occupied_beds}/${stats?.total_beds}`, color: 'text-slate-600', bg: 'bg-slate-50', icon: '🛏️' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{row.icon}</span>
                  <span className="text-xs text-slate-500">{row.label}</span>
                </div>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label={t.admissionsToday}  value={stats?.admissions_today}  icon="📋" bg="bg-violet-50"  text="text-violet-600" />
        <KPICard label={t.criticalPatients} value={stats?.critical_patients} icon="⚠️" bg="bg-red-50"     text="text-red-600" />
        <KPICard label={t.pendingInvoices}  value={stats?.pending_invoices}  icon="📄" bg="bg-amber-50"   text="text-amber-600" />
        <KPICard label={t.dischargesToday}  value={stats?.discharges_today}  icon="✅" bg="bg-emerald-50" text="text-emerald-600" />
      </div>

    </div>
  );
}
