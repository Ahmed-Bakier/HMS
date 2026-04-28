export default function Overview({ patient }) {
  const fields = [
    { label: 'Full Name',       value: patient.full_name },
    { label: 'Date of Birth',   value: patient.date_of_birth },
    { label: 'Age',             value: `${patient.age} years` },
    { label: 'Gender',          value: patient.gender },
    { label: 'Blood Type',      value: patient.blood_type || '—' },
    { label: 'Phone',           value: patient.phone      || '—' },
    { label: 'Email',           value: patient.email      || '—' },
    { label: 'Address',         value: patient.address    || '—' },
    { label: 'Insurance No.',   value: patient.insurance_no   || '—' },
    { label: 'Insurance Prov.', value: patient.insurance_prov || '—' },
    { label: 'Emergency Name',  value: patient.emergency_name || '—' },
    { label: 'Emergency Rel.',  value: patient.emergency_rel  || '—' },
    { label: 'Emergency Phone', value: patient.emergency_ph   || '—' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {fields.map(f => (
        <div key={f.label} className="flex justify-between py-3 border-b border-slate-50">
          <span className="text-sm text-slate-400">{f.label}</span>
          <span className="text-sm font-medium text-slate-700 text-right">{f.value}</span>
        </div>
      ))}
    </div>
  );
}
