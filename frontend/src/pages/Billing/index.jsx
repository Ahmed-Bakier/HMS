import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const statusColor = {
  paid:      'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function InvoicePrint({ invoice, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_uid}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: white; }
          .invoice { max-width: 700px; margin: 40px auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
          .logo span { display: block; font-size: 12px; font-weight: 400; color: #64748b; margin-top: 4px; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 32px; font-weight: 700; color: #0f172a; }
          .invoice-title p { font-size: 14px; color: #64748b; margin-top: 4px; }
          .divider { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
          .info-block h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 8px; }
          .info-block p { font-size: 14px; color: #1e293b; line-height: 1.6; }
          .info-block .name { font-size: 16px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead { background: #f8fafc; }
          th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
          td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
          .amount-col { text-align: right; }
          .total-row { background: #f8fafc; }
          .total-row td { font-weight: 700; font-size: 16px; padding: 16px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-paid      { background: #d1fae5; color: #065f46; }
          .status-pending   { background: #fef3c7; color: #92400e; }
          .status-overdue   { background: #fee2e2; color: #991b1b; }
          .status-cancelled { background: #f1f5f9; color: #475569; }
          .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
          .footer p { font-size: 12px; color: #94a3b8; line-height: 1.8; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Invoice Preview</h3>
          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition flex items-center gap-2">
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose}
              className="border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition">
              Close
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div ref={printRef}>
          <div className="invoice" style={{maxWidth:'700px',margin:'40px auto',padding:'40px'}}>

            {/* Header */}
            <div className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'40px'}}>
              <div>
                <div className="logo" style={{fontSize:'24px',fontWeight:'800',color:'#2563eb'}}>🏥 MediCore</div>
                <span style={{display:'block',fontSize:'12px',color:'#64748b',marginTop:'4px'}}>Hospital Management System</span>
                <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'8px'}}>123 Medical Center Blvd<br/>Istanbul, Turkey</p>
              </div>
              <div style={{textAlign:'right'}}>
                <h1 style={{fontSize:'32px',fontWeight:'700',color:'#0f172a'}}>INVOICE</h1>
                <p style={{fontSize:'14px',color:'#64748b',marginTop:'4px'}}>{invoice.invoice_uid}</p>
                <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'4px'}}>
                  Issued: {new Date(invoice.issued_at).toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}
                </p>
                {invoice.paid_at && (
                  <p style={{fontSize:'12px',color:'#94a3b8'}}>
                    Paid: {new Date(invoice.paid_at).toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}
                  </p>
                )}
              </div>
            </div>

            <hr style={{border:'none',borderTop:'2px solid #e2e8f0',margin:'24px 0'}} />

            {/* Bill To / From */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'32px'}}>
              <div>
                <h3 style={{fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',color:'#94a3b8',marginBottom:'8px'}}>Bill To</h3>
                <p style={{fontSize:'16px',fontWeight:'600',color:'#1e293b'}}>{invoice.patient_name}</p>
                <p style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>Patient</p>
              </div>
              <div>
                <h3 style={{fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',color:'#94a3b8',marginBottom:'8px'}}>Attending Physician</h3>
                <p style={{fontSize:'16px',fontWeight:'600',color:'#1e293b'}}>{invoice.doctor_name || '—'}</p>
                <p style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>Doctor</p>
              </div>
            </div>

            {/* Services Table */}
            <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'24px'}}>
              <thead style={{background:'#f8fafc'}}>
                <tr>
                  <th style={{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em',color:'#64748b'}}>Description</th>
                  <th style={{textAlign:'right',padding:'12px 16px',fontSize:'12px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em',color:'#64748b'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{padding:'16px',fontSize:'14px',borderBottom:'1px solid #f1f5f9'}}>
                    <p style={{fontWeight:'500',color:'#1e293b'}}>{invoice.service || 'Medical Service'}</p>
                    {invoice.notes && <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'4px'}}>{invoice.notes}</p>}
                  </td>
                  <td style={{padding:'16px',fontSize:'14px',borderBottom:'1px solid #f1f5f9',textAlign:'right',fontWeight:'600'}}>${invoice.amount}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{background:'#f8fafc'}}>
                  <td style={{padding:'16px',fontWeight:'700',fontSize:'16px'}}>Total</td>
                  <td style={{padding:'16px',fontWeight:'700',fontSize:'20px',textAlign:'right',color:'#2563eb'}}>${invoice.amount}</td>
                </tr>
              </tfoot>
            </table>

            {/* Status */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',background:'#f8fafc',borderRadius:'12px'}}>
              <span style={{fontSize:'14px',color:'#64748b',fontWeight:'500'}}>Payment Status</span>
              <span style={{
                display:'inline-block',padding:'6px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'700',textTransform:'uppercase',
                background: invoice.status==='paid' ? '#d1fae5' : invoice.status==='pending' ? '#fef3c7' : invoice.status==='overdue' ? '#fee2e2' : '#f1f5f9',
                color: invoice.status==='paid' ? '#065f46' : invoice.status==='pending' ? '#92400e' : invoice.status==='overdue' ? '#991b1b' : '#475569',
              }}>
                {invoice.status}
              </span>
            </div>

            {/* Footer */}
            <div style={{textAlign:'center',marginTop:'48px',paddingTop:'24px',borderTop:'1px solid #e2e8f0'}}>
              <p style={{fontSize:'12px',color:'#94a3b8',lineHeight:'1.8'}}>
                Thank you for choosing MediCore Hospital<br/>
                For inquiries, contact billing@medicore.com · +90 555 000 0000<br/>
                This is a computer-generated invoice and requires no signature.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const { user }                  = useAuthStore();
  const [invoices, setInvoices]   = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [patients, setPatients]   = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [form, setForm] = useState({ patient:'', doctor:'', service:'', amount:'', notes:'' });

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/invoices/'), api.get('/invoices/summary/')])
      .then(([inv, sum]) => { setInvoices(inv.data.results ?? inv.data); setSummary(sum.data); })
      .finally(() => setLoading(false));
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

  const handlePay = async id => { await api.patch(`/invoices/${id}/pay/`); load(); };

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
            { label:"Today's Revenue",  value:`$${summary.today}`,  color:'text-emerald-600', bg:'bg-emerald-50', icon:'💰' },
            { label:"This Month",       value:`$${summary.month}`,  color:'text-blue-600',    bg:'bg-blue-50',    icon:'📅' },
            { label:"Pending Invoices", value:summary.pending,      color:'text-amber-600',   bg:'bg-amber-50',   icon:'⏳' },
            { label:"Overdue",          value:summary.overdue,      color:'text-red-600',     bg:'bg-red-50',     icon:'⚠️' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..."
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(inv.issued_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPrintInvoice(inv)}
                      className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-lg transition">
                      🖨️ Print
                    </button>
                    {inv.status === 'pending' && (
                      <button onClick={() => handlePay(inv.id)}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-lg transition">
                        ✅ Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print Modal */}
      {printInvoice && <InvoicePrint invoice={printInvoice} onClose={() => setPrintInvoice(null)} />}

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
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
                    placeholder="Consultation..."
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
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">Cancel</button>
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
