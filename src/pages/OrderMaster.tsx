import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  ClipboardEdit,
  Loader2,
  PlusCircle,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { getCookie } from "../utils/cookieHelper";

const API_BASE_URL = "http://127.0.0.1:8000/api";

type Customer = { id: number | string; name?: string };
type Item = { id: number | string; name?: string };
type OrderItem = {
  id?: number | string;
  itemid: number | string;
  itemweight: number;
  status?: string;
};
type Order = {
  id: number | string;
  customerid: number | string;
  orderdate: string;
  orderstatus?: string;
  items: OrderItem[];
};

const OrderMaster = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    customerid: "",
    orderdate: new Date().toISOString().split("T")[0],
    orderstatus: "intransit",
    itemid: "",
    itemweight: "",
    itemstatus: "ordered",
    created_by: "1",
  });

  const showToast = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const getAuthHeaders = (options?: { json?: boolean }) => {
    const token = getCookie("auth_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options?.json !== false) headers["Content-Type"] = "application/json";
    return headers;
  };

  const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE_URL}/customers`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    const list = (data.data || data || []) as any[];
    return list.map((c) => ({
      id: c.id ?? c.customer_id ?? c._id ?? Math.random().toString(36).slice(2),
      name: c.customer_name || c.name || "",
    })) as Customer[];
  };

  const fetchItems = async () => {
    const res = await fetch(`${API_BASE_URL}/items`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    const list = (data.data || data || []) as any[];
    return list.map((it) => ({
      id: it.id ?? it.item_id ?? it._id ?? Math.random().toString(36).slice(2),
      name: it.itemname || it.name || "",
    })) as Item[];
  };

  const normalizeItem = (it: any): OrderItem => ({
    id: it.id ?? it.orderitem_id ?? it.order_item_id ?? it._id,
    itemid: it.itemid ?? it.item_id ?? it.id ?? it.item,
    itemweight: Number(it.itemweight ?? it.item_weight ?? it.weight ?? 0),
    status: it.status ?? it.itemstatus ?? it.state ?? "ordered",
  });

  const normalizeOrder = (raw: any): Order => {
    const itemsRaw = raw.items ?? raw.orderitems ?? raw.order_items ?? raw.orderitem ?? [];
    const itemsArr = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];
    const items = itemsArr.length > 0 ? itemsArr.map(normalizeItem) : [];
    if (items.length === 0 && (raw.itemid || raw.item_id)) {
      items.push(
        normalizeItem({
          itemid: raw.itemid ?? raw.item_id,
          itemweight: raw.itemweight ?? raw.item_weight ?? 0,
          status: raw.itemstatus ?? raw.status,
        })
      );
    }
    return {
      id: raw.id ?? raw.order_id ?? raw._id ?? Math.random().toString(36).slice(2),
      customerid: raw.customerid ?? raw.customer_id ?? raw.customer ?? raw.customerid_id ?? "",
      orderdate: raw.orderdate ?? raw.order_date ?? raw.date ?? "",
      orderstatus: raw.orderstatus ?? raw.status ?? "intransit",
      items,
    };
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    const list = (data.data || data || []) as any[];
    return list.map(normalizeOrder) as Order[];
  };

  const fetchOrderItems = async (orderId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/orderitems/index/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    const list = (data.data || data || []) as any[];
    return list.map(normalizeItem) as OrderItem[];
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [c, i, o] = await Promise.all([fetchCustomers(), fetchItems(), fetchOrders()]);
      setCustomers(c);
      setItems(i);
      setOrders(o);
    } catch (err) {
      console.error(err);
      showToast("Failed to load order data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerid || !formData.orderdate || !formData.itemid) {
      showToast("Please fill in required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerid: Number(formData.customerid),
        orderdate: formData.orderdate,
        orderstatus: formData.orderstatus,
        created_by: Number(formData.created_by || 1),
        items: [
          {
            itemid: Number(formData.itemid),
            itemweight: Number(formData.itemweight || 0),
            status: formData.itemstatus,
            created_by: Number(formData.created_by || 1),
          },
        ],
      };

      const res = await fetch(`${API_BASE_URL}/orders${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast(editingId ? "Order updated" : "Order created", "success");
      setEditingId(null);
      setFormData({
        customerid: "",
        orderdate: new Date().toISOString().split("T")[0],
        orderstatus: "intransit",
        itemid: "",
        itemweight: "",
        itemstatus: "ordered",
        created_by: "1",
      });
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("Failed to save order", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Delete this order?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Order deleted", "success");
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (row: Order) => {
    let rowItems = row.items || [];
    if (!rowItems.length) {
      try {
        rowItems = await fetchOrderItems(row.id);
      } catch (err) {
        console.error(err);
      }
    }
    const firstItem = rowItems[0];
    setEditingId(row.id);
    setFormData({
      customerid: String(row.customerid),
      orderdate: row.orderdate?.split("T")[0] || "",
      orderstatus: row.orderstatus || "intransit",
      itemid: firstItem ? String(firstItem.itemid) : "",
      itemweight: firstItem ? String(firstItem.itemweight ?? "") : "",
      itemstatus: firstItem?.status || "ordered",
      created_by: "1",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = orders.filter((o) => o.orderdate?.split("T")[0] === selectedDate);

  const dayTotals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        const weight = (row.items || []).reduce((sum, it) => sum + Number(it.itemweight || 0), 0);
        acc.totalWeight += weight;
        acc.totalItems += (row.items || []).length;
        return acc;
      },
      { totalWeight: 0, totalItems: 0 }
    );
  }, [filtered]);

  const getCustomerName = (id: number | string) => {
    const c = customers.find((x) => String(x.id) === String(id));
    return c?.name || `Customer ${id}`;
  };

  const getItemName = (id: number | string) => {
    const it = items.find((x) => String(x.id) === String(id));
    return it?.name || `Item ${id}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {msg && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            msg.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {msg.type === "error" ? <AlertCircle size={20} /> : <PlusCircle size={20} />}
          <span className="font-medium">{msg.text}</span>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">Order Master</h1>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Ledger</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 md:gap-6">
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 ring-1 ring-blue-200/50">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Today's Orders</p>
                <p className="text-sm font-black text-blue-900 md:text-lg tabular-nums">
                  {dayTotals.totalWeight.toFixed(2)} Kg
                </p>
                <p className="text-[10px] font-bold text-blue-700">{dayTotals.totalItems} Items</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600">
              {editingId ? "Update Order" : "Create Order"}
            </h2>
          </div>
          <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Customer
              </label>
              <select
                value={formData.customerid}
                onChange={(e) => setFormData({ ...formData, customerid: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || `Customer ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Order Date
              </label>
              <input
                type="date"
                value={formData.orderdate}
                onChange={(e) => setFormData({ ...formData, orderdate: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Item
              </label>
              <select
                value={formData.itemid}
                onChange={(e) => setFormData({ ...formData, itemid: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                required
              >
                <option value="">Select Item</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name || `Item ${it.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Item Weight (Kg)
              </label>
              <input
                type="number"
                value={formData.itemweight}
                onChange={(e) => setFormData({ ...formData, itemweight: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Order Status
              </label>
              <select
                value={formData.orderstatus}
                onChange={(e) => setFormData({ ...formData, orderstatus: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              >
                <option value="ordered">Ordered</option>
                <option value="intransit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                Item Status
              </label>
              <select
                value={formData.itemstatus}
                onChange={(e) => setFormData({ ...formData, itemstatus: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              >
                <option value="ordered">Ordered</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-center justify-between">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      customerid: "",
                      orderdate: new Date().toISOString().split("T")[0],
                      orderstatus: "intransit",
                      itemid: "",
                      itemweight: "",
                      itemstatus: "ordered",
                      created_by: "1",
                    });
                  }}
                  className="text-sm text-slate-500 underline"
                >
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
              >
                {saving ? "Saving..." : editingId ? "Update Order" : "Save Order"}
                <PlusCircle size={18} />
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 uppercase text-[10px] font-black tracking-widest text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Item</th>
                  <th className="px-5 py-4 text-right">Weight (Kg)</th>
                  <th className="px-5 py-4 text-center">Order Status</th>
                  <th className="px-5 py-4 text-center">Item Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-slate-400">
                      No orders logged for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const weight = (row.items || []).reduce((sum, it) => sum + Number(it.itemweight || 0), 0);
                    const firstItem = row.items?.[0];
                    const itemLabel = firstItem
                      ? `${getItemName(firstItem.itemid)}${row.items.length > 1 ? ` +${row.items.length - 1}` : ""}`
                      : "—";
                    return (
                      <tr key={row.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-800">{getCustomerName(row.customerid)}</td>
                        <td className="px-5 py-3 text-slate-700 font-semibold">{itemLabel}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-slate-600">{weight.toFixed(2)} Kg</td>
                        <td className="px-5 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                            {row.orderstatus || "ordered"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
                            {firstItem?.status || "ordered"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(row)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <ClipboardEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="bg-slate-900 text-white shadow-2xl">
                  <tr>
                    <td colSpan={3} className="px-5 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Total for {selectedDate}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-bold">
                      {dayTotals.totalWeight.toFixed(2)} Kg
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-xl font-black text-blue-400">
                      {dayTotals.totalItems} Items
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-500">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <AlertCircle size={16} />
          </div>
          <p className="leading-relaxed">
            Use the form to create or update orders. Entries are filtered by the selected date above.
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderMaster;
