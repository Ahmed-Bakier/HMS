import { useEffect, useState } from 'react';
import api from '../../../api/axios';

const statusColor = {
  confirmed:   'bg-emerald-100 text-emerald-700',
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-slate-100 text-slate-500',
  cancelled:   'bg-red-100 text-red-700',
};

export default function Appointments({ patientId }) {
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${patientId}/appointments/`)
      .then(r => setAppts(r.data))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading appointments...</div>;
  if (!appts.length) return <div className="text-slate-400 text-sm">No appointments found.</div>;

  return (
    <div className="space-y-3">
      {appts.map(a => (
        <div key={a.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center bg-white rounded-lg p-2 shadow-sm w-14">
              <p className="text-xs text-slate-400">{new Date(a.appt_date).toLocaleDateString('en',{month:'short'})}</p>
              <p className="text-lg font-bold text-slate-800">{new Date(a.appt_date).getDate()}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">{a.doctor_name}</p>
              <p className="text-xs text-slate-500">{a.type?.replace('_',' ')} · {a.appt_time} · {a.duration_min}min</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>
            {a.status?.replace('_',' ')}
          </span>
        </div>
      ))}
    </div>
  );
}
