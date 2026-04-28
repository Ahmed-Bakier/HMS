import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusColor = {
  paid:      'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function Billing() {
  const [invoices, setInvoices]   = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [patients, setPatients]   = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [form, setForm] = useState({ patient:'', doctor:'', service:'', amount:'', notes:'' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/invoices/'),
      api.get('/invoices/summary/'),
    ]).then(([inv, sum]) => {
      setInvoices(inv.data.results ?? inv.data);
      setSummary(sum.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/patients/').then(r => setPatients(r.data.results ?? r.data));
    api.get('/doctors/').then(r  => setDoctors(r.data.results  ?? r.data));
  }, []);

  const filtered = invoices.filter(i => {
    const matchSearch = `${i.patient_name} ${i.invoice_uid}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? i.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handlePay = async id => {
    await api.patch(`/invoices/${id}/pay/`);
    load();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/invoices/', form);
      setShowModal(false);
      setForm({ patient:'', doctor:'', service:'', amount:'', notes:'' });
      load();
    } catch { alert('Error creating invoice'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Today's Revenue",  value:`$${summary.today}`,   color:'text-emerald-600', bg:'bg-emerald-50', icon:'💰' },
            { label:"This Month",       value:`$${summary.month}`,   color:'text-blue-600',    bg:'bg-blue-50',    icon:'📅' },
            { label:"Pending Invoices", value:summary.pending,       color:'text-amber-600',   bg:'bg-amber-50',   icon:'⏳' },
            { label:"Overdue",          value:summary.overdue,       color:'text-red-600',     bg:'bg-red-50',     icon:'⚠️' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Invoices</h2>
          <p className="text-sm text-slate-500">{invoices.length} total</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {['paid','pending','overdue','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Invoice</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Doctor</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Service</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Amount</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Date</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">No invoices found</td></tr>
            ) : filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.invoice_uid}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{inv.patient_name}</td>
                <td className="px-6 py-4 text-slate-600">{inv.doctor_name || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{inv.service || '—'}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">${inv.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(inv.issued_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {inv.status === 'pending' && (
                    <button onClick={() => handlePay(inv.id)}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-lg transition">
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">New Invoice</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Patient</label>
                <select required value={form.patient} onChange={e => setForm({...form, patient: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Select Patient —</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_uid})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Doctor (optional)</label>
                <select value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Service</label>
                  <input value={form.service} onChange={e => setForm({...form, service: e.target.value})}
                    placeholder="Consultation, Lab test..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
