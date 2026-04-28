import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusColor = {
  available:  'bg-emerald-100 text-emerald-700',
  in_surgery: 'bg-red-100 text-red-700',
  on_break:   'bg-amber-100 text-amber-700',
  off_duty:   'bg-slate-100 text-slate-500',
};

export default function Doctors() {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');

  useEffect(() => {
    api.get('/doctors/')
      .then(r => setDoctors(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    `${d.full_name} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Doctors</h2>
          <p className="text-sm text-slate-500">{doctors.length} staff members</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search doctors..."
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Doctor</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Specialty</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Department</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Experience</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No doctors found</td></tr>
            ) : filtered.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                      {doc.user?.first_name?.[0]}{doc.user?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{doc.full_name}</p>
                      <p className="text-xs text-slate-400">{doc.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{doc.specialty}</td>
                <td className="px-6 py-4 text-slate-600">{doc.department_name ?? '—'}</td>
                <td className="px-6 py-4 text-slate-600">{doc.experience_yrs} yrs</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[doc.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {doc.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-amber-500 font-medium">
                  ⭐ {doc.rating ?? '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
