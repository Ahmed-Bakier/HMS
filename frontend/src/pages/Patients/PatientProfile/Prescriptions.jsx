import { useEffect, useState } from 'react';
import api from '../../../api/axios';

const statusColor = {
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-500',
  stopped:   'bg-red-100 text-red-700',
};

export default function Prescriptions({ patientId }) {
  const [rxs, setRxs]         = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${patientId}/prescriptions/`)
      .then(r => setRxs(r.data))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading prescriptions...</div>;
  if (!rxs.length) return <div className="text-slate-400 text-sm">No prescriptions found.</div>;

  return (
    <div className="space-y-3">
      {rxs.map(rx => (
        <div key={rx.id} className="p-4 bg-slate-50 rounded-xl flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💊</span>
            <div>
              <p className="font-semibold text-slate-800">{rx.drug_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{rx.dosage} · {rx.frequency}</p>
              <p className="text-xs text-slate-400 mt-1">By {rx.doctor_name} · {rx.start_date} → {rx.end_date || 'ongoing'}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[rx.status]}`}>
            {rx.status}
          </span>
        </div>
      ))}
    </div>
  );
}
