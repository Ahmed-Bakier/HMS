import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import Overview      from './Overview';
import Vitals        from './Vitals';
import History       from './History';
import Prescriptions from './Prescriptions';
import Appointments  from './Appointments';
import Billing       from './Billing';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: '📋' },
  { id: 'vitals',        label: 'Vitals',         icon: '❤️' },
  { id: 'history',       label: 'Medical History',icon: '📖' },
  { id: 'prescriptions', label: 'Prescriptions',  icon: '💊' },
  { id: 'appointments',  label: 'Appointments',   icon: '📅' },
  { id: 'billing',       label: 'Billing',        icon: '💰' },
];

const bloodColor = { 'A+':'bg-red-100 text-red-600','A-':'bg-red-100 text-red-600','B+':'bg-blue-100 text-blue-600','B-':'bg-blue-100 text-blue-600','AB+':'bg-purple-100 text-purple-600','AB-':'bg-purple-100 text-purple-600','O+':'bg-amber-100 text-amber-600','O-':'bg-amber-100 text-amber-600' };

export default function PatientProfile() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');

  useEffect(() => {
    api.get(`/patients/${id}/`)
      .then(r => setPatient(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">Loading...</div>;
  if (!patient) return <div className="text-slate-400">Patient not found</div>;

  return (
    <div className="space-y-6">

      {/* Back Button */}
      <button onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
        ← Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">{patient.full_name}</h2>
                {patient.blood_type && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${bloodColor[patient.blood_type]}`}>
                    {patient.blood_type}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{patient.patient_uid} · {patient.age} years · {patient.gender}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                {patient.phone    && <span>📞 {patient.phone}</span>}
                {patient.email    && <span>✉️ {patient.email}</span>}
                {patient.address  && <span>📍 {patient.address}</span>}
              </div>
            </div>
          </div>

          {/* Admission Badge */}
          <div>
            {patient.active_admission ? (
              <div className="text-right">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  🏥 Admitted
                </span>
                <p className="text-xs text-slate-400 mt-1">Ward {patient.active_admission.ward || '—'} · Bed {patient.active_admission.bed_number || '—'}</p>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                Outpatient
              </span>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {[
            { label: 'Insurance',       value: patient.insurance_prov || '—' },
            { label: 'Insurance No.',   value: patient.insurance_no   || '—' },
            { label: 'Emergency Contact', value: patient.emergency_name || '—' },
            { label: 'Emergency Phone', value: patient.emergency_ph   || '—' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-400">{f.label}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview'      && <Overview      patient={patient} />}
          {tab === 'vitals'        && <Vitals        patientId={id} />}
          {tab === 'history'       && <History       patientId={id} />}
          {tab === 'prescriptions' && <Prescriptions patientId={id} />}
          {tab === 'appointments'  && <Appointments  patientId={id} />}
          {tab === 'billing'       && <Billing       patientId={id} />}
        </div>
      </div>

    </div>
  );
}
