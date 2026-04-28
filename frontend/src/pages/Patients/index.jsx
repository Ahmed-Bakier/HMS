import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const bloodColor = { 'A+':'bg-red-100 text-red-600','A-':'bg-red-100 text-red-600','B+':'bg-blue-100 text-blue-600','B-':'bg-blue-100 text-blue-600','AB+':'bg-purple-100 text-purple-600','AB-':'bg-purple-100 text-purple-600','O+':'bg-amber-100 text-amber-600','O-':'bg-amber-100 text-amber-600' };

export default function Patients() {
  const navigate                  = useNavigate();
  const { user }                  = useAuthStore();
  const canWrite                  = ['super_admin','admin','doctor','nurse'].includes(user?.role);
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ first_name:'', last_name:'', date_of_birth:'', gender:'male', blood_type:'', phone:'', email:'' });
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/patients/').then(r => setPatients(r.data.results ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = patients.filter(p =>
    `${p.full_name} ${p.patient_uid} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/patients/', form);
      setShowModal(false);
      setForm({ first_name:'', last_name:'', date_of_birth:'', gender:'male', blood_type:'', phone:'', email:'' });
      load();
    } catch { alert('Error saving patient'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Patients</h2>
          <p className="text-sm text-slate-500">{patients.length} total patients</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          {canWrite && (
            <button onClick={e => { e.stopPropagation(); setShowModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              + Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Age / Gender</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Blood Type</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Phone</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Admission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No patients found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="hover:bg-slate-50 transition cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{p.full_name}</p>
                      <p className="text-xs text-slate-400">{p.email || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.patient_uid}</td>
                <td className="px-6 py-4 text-slate-600">{p.age} yrs / <span className="capitalize">{p.gender}</span></td>
                <td className="px-6 py-4">
                  {p.blood_type ? <span className={`px-2 py-0.5 rounded text-xs font-bold ${bloodColor[p.blood_type]}`}>{p.blood_type}</span> : '—'}
                </td>
                <td className="px-6 py-4 text-slate-600">{p.phone || '—'}</td>
                <td className="px-6 py-4">
                  {p.active_admission
                    ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Ward {p.active_admission.ward || '—'} · Bed {p.active_admission.bed_number || '—'}</span>
                    : <span className="text-slate-400 text-xs">Outpatient</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && canWrite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Patient</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                  <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                  <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input required type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Blood Type</label>
                  <select value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Select —</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
