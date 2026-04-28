import { useEffect, useState } from 'react';
import api from '../../api/axios';

const roleColor = {
  super_admin:   'bg-red-100 text-red-700',
  admin:         'bg-purple-100 text-purple-700',
  doctor:        'bg-blue-100 text-blue-700',
  nurse:         'bg-cyan-100 text-cyan-700',
  receptionist:  'bg-emerald-100 text-emerald-700',
  pharmacist:    'bg-amber-100 text-amber-700',
  lab_tech:      'bg-pink-100 text-pink-700',
  billing_clerk: 'bg-slate-100 text-slate-600',
};

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', role:'nurse', department:'', password:'', password2:'' });

  const load = () => {
    setLoading(true);
    api.get('/users/').then(r => setUsers(r.data.results ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    `${u.full_name} ${u.email} ${u.role} ${u.employee_id}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.password2) return alert('Passwords do not match');
    setSaving(true);
    try {
      await api.post('/auth/register/', form);
      setShowModal(false);
      setForm({ first_name:'', last_name:'', email:'', phone:'', role:'nurse', department:'', password:'', password2:'' });
      load();
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'));
    } finally { setSaving(false); }
  };

  const handleDeactivate = async id => {
    if (!confirm('Deactivate this user?')) return;
    await api.delete(`/users/${id}/`);
    load();
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Staff Users</h2>
          <p className="text-sm text-slate-500">{users.length} active members</p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">User</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Employee ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Role</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Department</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Phone</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Joined</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold text-sm">
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.full_name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.employee_id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColor[u.role] ?? 'bg-slate-100 text-slate-500'}`}>
                    {u.role?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.department || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.date_joined).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDeactivate(u.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Staff Member</h3>
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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['super_admin','admin','doctor','nurse','receptionist','pharmacist','lab_tech','billing_clerk'].map(r =>
                      <option key={r} value={r}>{r.replace('_',' ')}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                  <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                  <input required type="password" value={form.password2} onChange={e => setForm({...form, password2: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
