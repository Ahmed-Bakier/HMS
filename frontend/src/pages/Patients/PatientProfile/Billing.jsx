import { useEffect, useState } from 'react';
import api from '../../../api/axios';

const statusColor = {
  paid:      'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function Billing({ patientId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get(`/patients/${patientId}/invoices/`)
      .then(r => setInvoices(r.data))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading billing...</div>;
  if (!invoices.length) return <div className="text-slate-400 text-sm">No invoices found.</div>;

  const total = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + parseFloat(i.amount), 0);

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-emerald-700 font-medium">Total Paid</span>
        <span className="text-xl font-bold text-emerald-600">${total.toFixed(2)}</span>
      </div>
      <div className="space-y-3">
        {invoices.map(inv => (
          <div key={inv.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{inv.invoice_uid}</p>
              <p className="text-xs text-slate-500 mt-0.5">{inv.service || '—'} · {new Date(inv.issued_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">${inv.amount}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
