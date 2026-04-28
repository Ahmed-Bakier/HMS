import { useEffect, useState } from 'react';
import api from '../../../api/axios';

const typeColor = {
  condition:      'bg-red-100 text-red-700',
  allergy:        'bg-amber-100 text-amber-700',
  surgery:        'bg-blue-100 text-blue-700',
  family_history: 'bg-purple-100 text-purple-700',
};

export default function History({ patientId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${patientId}/history/`)
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading history...</div>;
  if (!history.length) return <div className="text-slate-400 text-sm">No medical history recorded.</div>;

  return (
    <div className="space-y-3">
      {history.map(h => (
        <div key={h.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColor[h.type]}`}>
            {h.type.replace('_',' ')}
          </span>
          <div className="flex-1">
            <p className="text-sm text-slate-700">{h.description}</p>
            {h.noted_at && <p className="text-xs text-slate-400 mt-1">{h.noted_at}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
