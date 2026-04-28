import { useEffect, useState } from 'react';
import api from '../../../api/axios';

export default function Vitals({ patientId }) {
  const [vitals, setVitals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${patientId}/vitals/`)
      .then(r => setVitals(r.data))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading vitals...</div>;
  if (!vitals.length) return <div className="text-slate-400 text-sm">No vitals recorded yet.</div>;

  return (
    <div className="space-y-3">
      {vitals.map(v => (
        <div key={v.id} className="bg-slate-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400">{new Date(v.recorded_at).toLocaleString()}</span>
            <span className="text-xs text-slate-500">By: {v.recorded_by_name || '—'}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Blood Pressure', value: v.blood_pressure, icon: '🩸', unit: 'mmHg' },
              { label: 'Heart Rate',     value: v.heart_rate,     icon: '❤️', unit: 'bpm'  },
              { label: 'Temperature',    value: v.temperature,    icon: '🌡️', unit: '°C'   },
              { label: 'O₂ Saturation',  value: v.o2_saturation,  icon: '💨', unit: '%'    },
              { label: 'Resp. Rate',     value: v.resp_rate,      icon: '🫁', unit: '/min' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-lg">{m.icon}</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{v[m.label.toLowerCase().replace(/[^a-z]/g,'')] ?? v.blood_pressure ?? '—'}</p>
                <p className="text-xs text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
