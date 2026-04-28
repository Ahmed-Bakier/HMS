import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusColor = {
  in_stock:     'bg-emerald-100 text-emerald-700',
  low_stock:    'bg-amber-100 text-amber-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

export default function Pharmacy() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ name:'', category:'', stock_qty:0, unit:'', supplier:'', expiry_date:'', reorder_at:50, unit_price:'' });

  const load = () => {
    setLoading(true);
    api.get('/inventory/').then(r => setItems(r.data.results ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const matchSearch = `${i.name} ${i.drug_uid} ${i.supplier}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? i.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const lowStockCount = items.filter(i => i.status !== 'in_stock').length;

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/inventory/', form);
      setShowModal(false);
      setForm({ name:'', category:'', stock_qty:0, unit:'', supplier:'', expiry_date:'', reorder_at:50, unit_price:'' });
      load();
    } catch { alert('Error saving item'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Pharmacy Inventory</h2>
          <p className="text-sm text-slate-500">
            {items.length} items
            {lowStockCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {lowStockCount} need attention</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search drugs..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Add Drug
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-700 font-medium">{lowStockCount} item(s) are low or out of stock — reorder soon.</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Drug</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Category</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Stock</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Reorder At</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Expiry</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Price</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">No items found</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.supplier || '—'}</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.drug_uid}</td>
                <td className="px-6 py-4 text-slate-600">{item.category || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${item.stock_qty === 0 ? 'text-red-600' : item.stock_qty < item.reorder_at ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {item.stock_qty}
                  </span>
                  <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{item.reorder_at}</td>
                <td className="px-6 py-4 text-slate-600">{item.expiry_date || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{item.unit_price ? `$${item.unit_price}` : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[item.status]}`}>
                    {item.status?.replace('_',' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Drug Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Drug to Inventory</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Drug Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Stock Qty</label>
                  <input required type="number" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    placeholder="tablets"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Reorder At</label>
                  <input type="number" value={form.reorder_at} onChange={e => setForm({...form, reorder_at: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price ($)</label>
                  <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Drug'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
