import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const statusColor = {
  available:  'bg-emerald-100 text-emerald-700',
  in_surgery: 'bg-red-100 text-red-700',
  on_break:   'bg-amber-100 text-amber-700',
  off_duty:   'bg-slate-100 text-slate-500',
};

export default function Doctors() {
  const { user }                  = useAuthStore();
  const canWrite                  = ['super_admin','admin'].includes(user?.role);
  const [doctors, setDoctors]     = useState([]);
  const [depts, setDepts]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [step, setStep]           = useState(1); // 1=create user, 2=create doctor profile
  const [newUserId, setNewUserId] = useState(null);

  const [userForm, setUserForm] = useState({ first_name:'', last_name:'', email:'', phone:'', password:'', password2:'' });
  const [docForm, setDocForm]   = useState({ specialty:'', department:'', license_no:'', experience_yrs:0, schedule:'', bio:'' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/doctors/'),
      api.get('/departments/'),
    ]).then(([d, dp]) => {
      setDoctors(d.data.results  ?? d.data);
      setDepts(dp.data.results   ?? dp.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = doctors.filter(d =>
    `${d.full_name} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setNewUserId(null);
    setUserForm({ first_name:'', last_name:'', email:'', phone:'', password:'', password2:'' });
    setDocForm({ specialty:'', department:'', license_no:'', experience_yrs:0, schedule:'', bio:'' });
  };

  // Step 1: Create User account
  const handleUserSubmit = async e => {
    e.preventDefault();
    if (userForm.password !== userForm.password2) return alert('Passwords do not match');
    setSaving(true);
    try {
      const { data } = await api.post('/auth/register/', { ...userForm, role: 'doctor' });
      setNewUserId(data.user.id);
      setStep(2);
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error creating user'));
    } finally { setSaving(false); }
  };

  // Step 2: Create Doctor profile linked to the user
  const handleDocSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/doctors/', { ...docForm, user: newUserId });
      resetModal();
      load();
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error creating doctor profile'));
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Doctors</h2>
          <p className="text-sm text-slate-500">{doctors.length} staff members</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          {canWrite && (
            <button onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              + Add Doctor
            </button>
          )}
        </div>
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
                    {doc.status?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-amber-500 font-medium">⭐ {doc.rating ?? '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      {showModal && canWrite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={resetModal}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Steps Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <span className="text-sm font-medium">Account Info</span>
              </div>
              <div className="flex-1 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <span className="text-sm font-medium">Doctor Profile</span>
              </div>
            </div>

            {/* Step 1 — User Account */}
            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 1 — Create Account</h3>
                <form onSubmit={handleUserSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                      <input required value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                      <input required value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                    <input value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                      <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                      <input required type="password" value={userForm.password2} onChange={e => setUserForm({...userForm, password2: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={resetModal}
                      className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                      {saving ? 'Creating...' : 'Next →'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2 — Doctor Profile */}
            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 2 — Doctor Profile</h3>
                <form onSubmit={handleDocSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Specialty</label>
                      <input required value={docForm.specialty} onChange={e => setDocForm({...docForm, specialty: e.target.value})}
                        placeholder="Cardiologist, Neurologist..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                      <select value={docForm.department} onChange={e => setDocForm({...docForm, department: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">— Select —</option>
                        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">License No.</label>
                      <input required value={docForm.license_no} onChange={e => setDocForm({...docForm, license_no: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Experience (years)</label>
                      <input type="number" value={docForm.experience_yrs} onChange={e => setDocForm({...docForm, experience_yrs: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Schedule</label>
                    <input value={docForm.schedule} onChange={e => setDocForm({...docForm, schedule: e.target.value})}
                      placeholder="Mon-Fri 9AM-5PM"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Bio</label>
                    <textarea value={docForm.bio} onChange={e => setDocForm({...docForm, bio: e.target.value})} rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">← Back</button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                      {saving ? 'Saving...' : '✅ Add Doctor'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
