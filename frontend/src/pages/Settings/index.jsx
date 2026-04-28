import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export default function Settings() {
  const { user, setAuth } = useAuthStore();
  const [form, setForm]   = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', department: user?.department || '' });
  const [pwForm, setPwForm] = useState({ old_password:'', new_password:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg]     = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const handleProfile = async e => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data } = await api.patch('/users/me/', form);
      setAuth(data, localStorage.getItem('access_token'));
      setMsg('✅ Profile updated successfully');
    } catch { setMsg('❌ Error updating profile'); }
    finally { setSaving(false); }
  };

  const handlePassword = async e => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) return setPwMsg('❌ Passwords do not match');
    setSavingPw(true);
    setPwMsg('');
    try {
      await api.post('/users/change-password/', { old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg('✅ Password changed successfully');
      setPwForm({ old_password:'', new_password:'', confirm:'' });
    } catch { setPwMsg('❌ Incorrect current password'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{user?.full_name}</h2>
            <p className="text-sm text-slate-500 capitalize">{user?.role?.replace('_',' ')} · {user?.employee_id}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-slate-700 mb-4">Edit Profile</h3>
        <form onSubmit={handleProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
              <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
              <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
            <input required type="password" value={pwForm.old_password} onChange={e => setPwForm({...pwForm, old_password: e.target.value})}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
              <input required type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
              <input required type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {pwMsg && <p className="text-sm">{pwMsg}</p>}
          <button type="submit" disabled={savingPw}
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-6 py-2 rounded-lg transition disabled:opacity-50">
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">System Info</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">System</span>
            <span className="font-medium">MediCore HMS v1.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Backend</span>
            <span className="font-medium">Django 5 + DRF</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Frontend</span>
            <span className="font-medium">React 18 + Vite</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Database</span>
            <span className="font-medium">MySQL 8</span>
          </div>
        </div>
      </div>

    </div>
  );
}
