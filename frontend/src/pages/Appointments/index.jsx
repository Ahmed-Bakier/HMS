import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusColor = {
  confirmed:   'bg-emerald-100 text-emerald-700',
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-slate-100 text-slate-500',
  cancelled:   'bg-red-100 text-red-700',
};

const typeColor = {
  consultation: 'bg-blue-50 text-blue-600',
  follow_up:    'bg-violet-50 text-violet-600',
  check_up:     'bg-emerald-50 text-emerald-600',
  procedure:    'bg-amber-50 text-amber-600',
  emergency:    'bg-red-50 text-red-600',
  imaging:      'bg-cyan-50 text-cyan-600',
  post_op:      'bg-pink-50 text-pink-600',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [doctors, setDoctors]           = useState([]);
  const [patients, setPatients]         = useState([]);
  const [saving, setSaving]             = useState(false);
  const [form, setForm] = useState({ patient:'', doctor:'', appt_date:'', appt_time:'', type:'consultation', duration_min:30, notes:'' });

  const load = () => {
    setLoading(true);
    api.get('/appointments/').then(r => setAppointments(r.data.results ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/doctors/').then(r  => setDoctors(r.data.results   ?? r.data));
    api.get('/patients/').then(r => setPatients(r.data.results  ?? r.data));
  }, []);

  const filtered = appointments.filter(a => {
    const matchSearch = `${a.patient_name} ${a.doctor_name} ${a.appt_uid}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? a.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/appointments/', form);
      setShowModal(false);
      setForm({ patient:'', doctor:'', appt_date:'', appt_time:'', type:'consultation', duration_min:30, notes:'' });
      load();
    } catch { alert('Error saving appointment'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status/`, { status });
    load();
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-500">{appointments.length} total</p>
        </div>
        <div className="flex gap-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {['confirmed','pending','in_progress','completed','cancelled'].map(s =>
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            )}
          </select>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Doctor</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Date & Time</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Type</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No appointments found</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{a.appt_uid}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{a.patient_name}</td>
                <td className="px-6 py-4 text-slate-600">{a.doctor_name}</td>
                <td className="px-6 py-4 text-slate-600">
                  <p>{a.appt_date}</p>
                  <p className="text-xs text-slate-400">{a.appt_time} · {a.duration_min}min</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColor[a.type] ?? 'bg-slate-100 text-slate-500'}`}>
                    {a.type?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>
                    {a.status?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['confirmed','pending','in_progress','completed','cancelled'].map(s =>
                      <option key={s} value={s}>{s.replace('_',' ')}</option>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Book Appointment</h3>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Doctor</label>
                <select required value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} · {d.specialty}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input required type="date" value={form.appt_date} onChange={e => setForm({...form, appt_date: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                  <input required type="time" value={form.appt_time} onChange={e => setForm({...form, appt_time: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['consultation','follow_up','check_up','procedure','imaging','post_op','emergency'].map(t =>
                      <option key={t} value={t}>{t.replace('_',' ')}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                  <input type="number" value={form.duration_min} onChange={e => setForm({...form, duration_min: e.target.value})}
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
                  {saving ? 'Saving...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
