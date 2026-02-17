import React, { useState, useEffect, useMemo } from 'react';
import { getCookie } from '../utils/cookieHelper';

// --- INLINE SVG ICONS ---
const Icons = {
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.51 2.7 2.7 0 0 0-3.41 0 2.7 2.7 0 0 1-3.39 0 2.7 2.7 0 0 0-3.41 0 2.7 2.7 0 0 1-1.59.51v0a2 2 0 0 1-2-2V7"/></svg>,
  Hotel: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 22v-6.57a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2V22"/><path d="M18 22V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v17"/><path d="M22 22H2"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
};

export default function ItemMaster() {
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const [activeTab, setActiveTab] = useState('ShopCompany');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'ShopCompany'
  });


  const getAuthHeaders = () => {
    const token = getCookie('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/items`, { method: 'GET', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      const list = (data.data || data || []) as any[];
      const mapped = list.map((it) => ({
        id: it.id ?? it.item_id ?? it._id,
        name: it.itemname || it.name || '',
        type: it.customertypeid === 1 ? 'ShopCompany' : 'Hotel',
      }));
      setProducts(mapped);
    } catch (err) {
      console.error(err);
      setConfigError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name) return showAlert('Item name is required', 'error');
    try {
      const payload = {
        itemname: formData.name,
        itemslug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        customertypeid: formData.type === 'ShopCompany' ? 1 : 2,
      };
      const res = await fetch(`${API_BASE_URL}/items`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      await fetchItems();
      setFormData({ ...formData, name: '' });
      showAlert('Item added successfully!', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      await fetchItems();
      showAlert('Item deleted', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Delete failed', 'error');
    }
  };


  const shopCompanyItems = products.filter((p) => p.type === 'ShopCompany');
  const hotelItems = products.filter((p) => p.type === 'Hotel');
  const displayedItems = activeTab === 'ShopCompany' ? shopCompanyItems : hotelItems;

  if (configError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
          <div className="text-red-500 mb-4 flex justify-center"><Icons.Warning /></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-500 text-sm mb-6">Unable to connect to database. Please check your connection.</p>
          <button onClick={() => { setConfigError(false); fetchItems(); }} className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}


      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Item Master Registry</h1>
          {message.text && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold animate-fade-in ${
              message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {message.text}
            </div>
          )}
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Create New Item Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Icons.Plus /> Create New Item
              </h2>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Item Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Fresh Tandoor"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Item Type</label>
                <select 
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none cursor-pointer"
                >
                  <option value="ShopCompany">Shop / Company (Live Bird)</option>
                  <option value="Hotel">Hotel (Processed Meat)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 rounded-lg transition-all shadow-md active:scale-95">
                  Save Product
                </button>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/30">
              <button 
                onClick={() => setActiveTab('ShopCompany')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ShopCompany' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icons.Store /> Shop / Company ({shopCompanyItems.length})
              </button>
              <button 
                onClick={() => setActiveTab('Hotel')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'Hotel' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icons.Hotel /> Hotel Items ({hotelItems.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Database Type</th>
                    <th className="px-6 py-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={3} className="py-12 text-center text-slate-400 animate-pulse">Updating...</td></tr>
                  ) : displayedItems.length === 0 ? (
                    <tr><td colSpan={3} className="py-12 text-center text-slate-400 italic">No items created in this category</td></tr>
                  ) : (
                    displayedItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                            item.type === 'Hotel' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {item.type === 'Hotel' ? 'Hotel Meat' : 'Shop / Co. Live'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
