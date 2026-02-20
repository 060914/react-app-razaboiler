import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Plus,
  Route,
  Store,
  Truck,
  UserCircle,
  XCircle,
} from "lucide-react";
import { getCookie } from "../utils/cookieHelper";

const API_BASE_URL = "http://127.0.0.1:8000/api";

type Vehicle = { id: number | string; vehicalid?: string; rcnumber?: string; vehicalmodel?: string };
type User = { id: number | string; name?: string; username?: string };
type Customer = { id: number | string; customer_name?: string; customername?: string };
type Item = { id: number | string; itemname?: string; name?: string };

type RouteRow = {
  id: number | string;
  vehicleid: number | string;
  driverid: number | string;
  deliverydate: string;
  status?: string;
};

type RouteStop = {
  id: number | string;
  routeid: number | string;
  customerid: number | string;
  itemid: number | string;
  itemqty: number | string;
  itemweight: number | string;
  rateofsale: number | string;
};

const RouteBuilder = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [routeForm, setRouteForm] = useState({
    vehicleid: "",
    driverid: "",
    deliverydate: new Date().toISOString().split("T")[0],
    status: "intransit",
    created_by: "1",
  });

  const [stopForm, setStopForm] = useState({
    customerid: "",
    itemid: "",
    itemqty: "",
    itemweight: "",
    rateofsale: "",
    created_by: "1",
  });

  const [editingStopId, setEditingStopId] = useState<string | number | null>(null);

  const getAuthHeaders = (options?: { json?: boolean }) => {
    const token = getCookie("auth_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options?.json !== false) headers["Content-Type"] = "application/json";
    return headers;
  };

  const fetchVehicles = async () => {
    const res = await fetch(`${API_BASE_URL}/vehicles`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    return (data.data || data || []) as Vehicle[];
  };

  const fetchDrivers = async () => {
    const res = await fetch(`${API_BASE_URL}/users`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    return (data.data || data || []) as User[];
  };

  const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE_URL}/customers`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    return (data.data || data || []) as Customer[];
  };

  const fetchItems = async () => {
    const res = await fetch(`${API_BASE_URL}/items`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    return (data.data || data || []) as Item[];
  };

  const fetchRoutes = async () => {
    const res = await fetch(`${API_BASE_URL}/route-builder`, { method: "GET", headers: getAuthHeaders() });
    const data = await res.json();
    return (data.data || data || []) as RouteRow[];
  };

  const fetchStops = async (routeId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/route-stops/index/${routeId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return (data.data || data || []) as RouteStop[];
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [v, d, c, i, r] = await Promise.all([
          fetchVehicles(),
          fetchDrivers(),
          fetchCustomers(),
          fetchItems(),
          fetchRoutes(),
        ]);
        setVehicles(v);
        setDrivers(d);
        setCustomers(c);
        setItems(i);
        setRoutes(r);
        if (r.length > 0) setActiveRouteId(r[0].id);
      } catch (err) {
        console.error(err);
        setError("Failed to load route builder data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeRouteId) {
      setStops([]);
      return;
    }
    const loadStops = async () => {
      try {
        const s = await fetchStops(activeRouteId);
        setStops(s);
      } catch (err) {
        console.error(err);
      }
    };
    loadStops();
  }, [activeRouteId]);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.vehicleid || !routeForm.driverid || !routeForm.deliverydate) {
      setError("Please select vehicle, driver and delivery date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/route-builder`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vehicleid: Number(routeForm.vehicleid),
          driverid: Number(routeForm.driverid),
          deliverydate: routeForm.deliverydate,
          status: routeForm.status,
          created_by: Number(routeForm.created_by),
        }),
      });
      if (!res.ok) throw new Error("Create route failed");
      const data = await res.json();
      const newRoute = data.data || data;
      const newId = newRoute?.id ?? newRoute?.routeid;
      await refreshRoutes(newId);
    } catch (err) {
      console.error(err);
      setError("Failed to create route.");
    } finally {
      setSaving(false);
    }
  };

  const refreshRoutes = async (selectId?: string | number) => {
    const r = await fetchRoutes();
    setRoutes(r);
    if (selectId) {
      setActiveRouteId(selectId);
      return;
    }
    if (r.length > 0) setActiveRouteId(r[0].id);
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRouteId) {
      setError("Please create a route header first.");
      return;
    }
    if (!stopForm.customerid || !stopForm.itemid || !stopForm.itemqty) {
      setError("Please select shop, item and quantity.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        routeid: Number(activeRouteId),
        customerid: Number(stopForm.customerid),
        itemid: Number(stopForm.itemid),
        itemqty: Number(stopForm.itemqty),
        itemweight: Number(stopForm.itemweight || 0),
        rateofsale: Number(stopForm.rateofsale || 0),
        created_by: Number(stopForm.created_by),
      };
      const res = await fetch(
        `${API_BASE_URL}/route-stops${editingStopId ? `/${editingStopId}` : ""}`,
        {
          method: editingStopId ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Save stop failed");
      setStopForm({ customerid: "", itemid: "", itemqty: "", itemweight: "", rateofsale: "", created_by: "1" });
      setEditingStopId(null);
      const s = await fetchStops(activeRouteId);
      setStops(s);
    } catch (err) {
      console.error(err);
      setError("Failed to save shop stop.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStop = (stop: RouteStop) => {
    setStopForm({
      customerid: String(stop.customerid || ""),
      itemid: String(stop.itemid || ""),
      itemqty: String(stop.itemqty || ""),
      itemweight: String(stop.itemweight || ""),
      rateofsale: String(stop.rateofsale || ""),
      created_by: "1",
    });
    setEditingStopId(stop.id);
  };

  const handleDeleteStop = async (id: string | number) => {
    if (!window.confirm("Delete this stop?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      if (activeRouteId) {
        const s = await fetchStops(activeRouteId);
        setStops(s);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete stop.");
    } finally {
      setSaving(false);
    }
  };

  const routeStopsTotal = useMemo(() => {
    return stops.reduce(
      (acc, s) => {
        const weight = Number(s.itemweight || 0);
        const rate = Number(s.rateofsale || 0);
        acc.totalWeight += weight;
        acc.totalValue += weight * rate;
        return acc;
      },
      { totalWeight: 0, totalValue: 0 }
    );
  }, [stops]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">Loading route builder...</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Route size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Route Builder</h1>
            <p className="text-sm text-slate-500">Plan delivery routes and shop stops</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Route Header */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <ClipboardList size={14} /> Route Header
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Vehicle</label>
                <select
                  value={routeForm.vehicleid}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleid: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicalid || v.rcnumber || v.vehicalmodel || `Vehicle ${v.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Driver</label>
                <select
                  value={routeForm.driverid}
                  onChange={(e) => setRouteForm({ ...routeForm, driverid: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.username || `User ${d.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Delivery Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    value={routeForm.deliverydate}
                    onChange={(e) => setRouteForm({ ...routeForm, deliverydate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 bg-slate-900 text-white font-bold py-3 rounded-full shadow-lg transition-all hover:bg-slate-800 disabled:bg-slate-400"
              >
                {saving ? "Saving..." : "Log Wholesale Trip"}
              </button>
            </form>

            <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-4">
              <UserCircle size={14} /> Active Route: {activeRouteId ? `#${activeRouteId}` : "None"}
            </div>
          </div>

          {/* Shop Stop Builder */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Plus size={14} /> Shop Stop Builder
            </div>

            <form onSubmit={handleSaveStop} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Shop</label>
                <select
                  value={stopForm.customerid}
                  onChange={(e) => setStopForm({ ...stopForm, customerid: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <option value="">Select Shop</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name || c.customername || `Customer ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Item</label>
                <select
                  value={stopForm.itemid}
                  onChange={(e) => setStopForm({ ...stopForm, itemid: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <option value="">Select Item</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.itemname || i.name || `Item ${i.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Qty (Birds)</label>
                <input
                  type="number"
                  value={stopForm.itemqty}
                  onChange={(e) => setStopForm({ ...stopForm, itemqty: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Weight (Kg)</label>
                <input
                  type="number"
                  value={stopForm.itemweight}
                  onChange={(e) => setStopForm({ ...stopForm, itemweight: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Sale Rate (₹)</label>
                <input
                  type="number"
                  value={stopForm.rateofsale}
                  onChange={(e) => setStopForm({ ...stopForm, rateofsale: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                  placeholder="0"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="md:col-span-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full shadow-lg transition-all disabled:bg-slate-400"
              >
                {editingStopId ? "Update Stop" : "Add Stop To Truck"}
              </button>
              {editingStopId && (
                <button
                  type="button"
                  className="md:col-span-2 text-xs text-slate-500 underline"
                  onClick={() => {
                    setEditingStopId(null);
                    setStopForm({ customerid: "", itemid: "", itemqty: "", itemweight: "", rateofsale: "", created_by: "1" });
                  }}
                >
                  Cancel edit
                </button>
              )}
            </form>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6">
              {stops.length === 0 ? (
                <div className="text-center text-xs font-bold text-slate-300 tracking-widest uppercase">
                  No shop stops defined for current trip
                </div>
              ) : (
                <div className="space-y-3">
                  {stops.map((stop) => {
                    const customer = customers.find((c) => String(c.id) === String(stop.customerid));
                    const item = items.find((i) => String(i.id) === String(stop.itemid));
                    return (
                      <div key={stop.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-slate-200">
                            <Store size={16} className="text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-700">
                              {customer?.customer_name || customer?.customername || `Customer ${stop.customerid}`}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-400">
                              {item?.itemname || item?.name || "Item"} • Qty {stop.itemqty} • {stop.itemweight} Kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditStop(stop)}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"
                            title="Edit"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {stops.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Truck size={14} /> Total Weight: {routeStopsTotal.totalWeight.toFixed(2)} Kg
                </div>
                <div className="text-slate-800 font-bold">
                  Total Value: ₹{routeStopsTotal.totalValue.toFixed(0)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stop Details Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <ClipboardList size={18} className="text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Stop Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="px-6 py-4 border-b border-slate-100">Shop</th>
                  <th className="px-6 py-4 border-b border-slate-100">Item</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Qty (Birds)</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Weight (Kg)</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Rate (₹)</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Total Amount</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No stops added for the active route.
                    </td>
                  </tr>
                ) : (
                  stops.map((stop) => {
                    const customer = customers.find((c) => String(c.id) === String(stop.customerid));
                    const item = items.find((i) => String(i.id) === String(stop.itemid));
                    const weight = Number(stop.itemweight || 0);
                    const rate = Number(stop.rateofsale || 0);
                    const total = weight * rate;
                    return (
                      <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {customer?.customer_name || customer?.customername || `Customer ${stop.customerid}`}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{item?.itemname || item?.name || "Item"}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600">{stop.itemqty}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600">{weight.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600">₹{rate.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right tabular-nums font-bold text-slate-900">
                          ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditStop(stop)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStop(stop.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {stops.length > 0 && (
                <tfoot className="bg-slate-900 text-white">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-400">
                      Total For Active Route
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold">
                      {routeStopsTotal.totalWeight.toFixed(2)} Kg
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-black text-emerald-400">
                      ₹{routeStopsTotal.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteBuilder;
