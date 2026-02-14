
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCircle, Sparkles, ArrowUpRight, TrendingDown, ShoppingBag, Fuel, 
  Loader2, Plus, Search, ChevronRight, Check, X, Info, Store, Zap, 
  Scissors, PackageCheck, Wallet, Truck, HandCoins, MapPin, ListOrdered, 
  Trash2, FileSpreadsheet, UserPlus, ClipboardList, Box, CreditCard, RotateCcw,
  Wrench, Coins, ReceiptIndianRupee, Droplet, Send, UserCheck, Edit2, Contact2, Factory, Phone, Utensils, AlertCircle, Copy, Bird, Calendar,
  TrendingUp, BarChart3, MessageCircle, PieChart
} from 'lucide-react';
import { 
  Role, MetricData, DailyPrices, HeavyRoute, PickupStop, ShopStop, HotelDeliveryRoute,
  CommercialOrder, OrderStatus, PaymentStatus, Vehicle, Staff, Client, OrderItem,
  ExpenseEntry, ExpenseType, Company
} from './types';
import { NAV_ITEMS, INITIAL_PRICES, HOTEL_CUTS, SHOP_LIVE } from './constants';
import { getAIInsight } from './services/geminiService';

// --- Helper for Date Inputs ---
const getTodayForInput = () => new Date().toISOString().split('T')[0];

// --- Shared Components ---

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 uppercase font-black text-xs tracking-widest ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subText: string; colorClass?: string; secondaryValue?: string; }> = ({ title, value, icon, subText, colorClass = "text-slate-900", secondaryValue }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{title}</p>
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{icon}</div>
    </div>
    <p className={`text-2xl font-black tracking-tighter uppercase ${colorClass}`}>{value}</p>
    {secondaryValue && <p className="text-xs font-black text-slate-400 mt-1">{secondaryValue}</p>}
    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{subText}</p>
  </div>
);

// --- MODULE: Reports & Analytics ---

const ReportsView: React.FC<{
  orders: CommercialOrder[];
  heavyRoutes: HeavyRoute[];
  expenses: ExpenseEntry[];
  clients: Client[];
  staff: Staff[];
}> = ({ orders, heavyRoutes, expenses, clients, staff }) => {
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const financialData = useMemo(() => {
    const now = new Date();
    const filterStart = new Date();
    if (timeFilter === 'Weekly') filterStart.setDate(now.getDate() - 7);
    else if (timeFilter === 'Monthly') filterStart.setMonth(now.getMonth() - 1);
    else filterStart.setHours(0, 0, 0, 0);

    const isAfterFilter = (timestamp: number) => timestamp >= filterStart.getTime();

    // 1. Sales Calculation
    const hotelSales = orders.filter(o => isAfterFilter(o.timestamp)).reduce((sum, o) => {
      const orderVal = o.items.reduce((iSum, item) => iSum + ((item.actualWeight || item.weight) * (item.sellingRate || 0)), 0);
      return sum + orderVal;
    }, 0);

    const shopSales = heavyRoutes.filter(r => r.type === 'ShopDelivery' && isAfterFilter(r.timestamp)).flatMap(r => r.stops as ShopStop[]).reduce((sum, s) => sum + (s.weight * s.rate), 0);
    const totalSales = hotelSales + shopSales;

    // 2. Cost Calculation
    const procurementCost = heavyRoutes.filter(r => r.type === 'Pickup' && isAfterFilter(r.timestamp)).flatMap(r => r.stops as PickupStop[]).reduce((sum, s) => sum + (s.weight * s.rate), 0);
    const opExpenses = expenses.filter(e => isAfterFilter(e.timestamp)).reduce((sum, e) => sum + e.amount, 0);
    
    // Pro-rated staff salaries
    const baseSalaries = staff.reduce((sum, s) => sum + s.salary, 0);
    let effectiveSalaries = baseSalaries;
    if (timeFilter === 'Weekly') effectiveSalaries = baseSalaries / 4.34; // average weeks in month
    else if (timeFilter === 'Daily') effectiveSalaries = baseSalaries / 30.41; // average days in month
    
    const totalCost = procurementCost + opExpenses + effectiveSalaries;
    const netProfit = totalSales - totalCost;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // 3. Collection & Receivables (Cash Flow)
    const hotelCollected = orders.filter(o => isAfterFilter(o.timestamp)).reduce((sum, o) => sum + (o.amountCollected || 0), 0);
    // Assume shop sales are generally immediate for this simplified view, but usually they'd have a collected field too
    const totalCollected = hotelCollected + shopSales; 
    const pendingAmount = Math.max(0, totalSales - totalCollected);

    // 4. Defaulter List (Highest Outstanding)
    const defaulters = clients.map(client => {
      const clientOrders = orders.filter(o => o.clientName === client.name);
      const totalBilled = clientOrders.reduce((sum, o) => sum + o.items.reduce((iS, i) => iS + ((i.actualWeight || i.weight) * (i.sellingRate || 0)), 0), 0);
      const totalReceived = clientOrders.reduce((sum, o) => sum + (o.amountCollected || 0), 0);
      const currentOutstanding = Math.max(0, client.balanceDue + (totalBilled - totalReceived));
      const lastOrder = clientOrders.filter(o => o.amountCollected && o.amountCollected > 0).sort((a,b) => b.timestamp - a.timestamp)[0];

      return {
        name: client.name,
        billed: totalBilled + client.balanceDue,
        received: totalReceived,
        pending: currentOutstanding,
        lastPaymentDate: lastOrder ? lastOrder.date : 'None',
        contact: client.contact
      };
    }).filter(d => d.pending > 0).sort((a, b) => b.pending - a.pending);

    // 5. Expense Breakdown
    const fuelExp = expenses.filter(e => e.type === ExpenseType.Fuel && isAfterFilter(e.timestamp)).reduce((s,e) => s+e.amount, 0);
    const maintExp = expenses.filter(e => e.type === ExpenseType.Maintenance && isAfterFilter(e.timestamp)).reduce((s,e) => s+e.amount, 0);
    const staffCosts = effectiveSalaries + expenses.filter(e => e.type === ExpenseType.Allowance && isAfterFilter(e.timestamp)).reduce((s,e) => s+e.amount, 0);

    return {
      totalSales, totalCost, netProfit, profitMargin,
      totalCollected, pendingAmount,
      defaulters,
      breakdown: { procurement: procurementCost, fuel: fuelExp, maintenance: maintExp, staff: staffCosts }
    };
  }, [orders, heavyRoutes, expenses, clients, staff, timeFilter]);

  const triggerWhatsApp = (clientName: string, amount: number, contact?: string) => {
    if (!contact) return alert("Contact missing for this client.");
    const text = `Dear ${clientName}, this is a payment reminder from Raza Boiler. Your outstanding balance is ₹${amount.toLocaleString()}. Kindly clear the dues at your earliest convenience. Thank you.`;
    window.open(`https://wa.me/${contact.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase italic">
            <BarChart3 className="text-blue-600" /> Financial Dashboard
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time profitability & recovery metrics</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit shadow-inner">
          {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setTimeFilter(f)} 
              className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest ${timeFilter === f ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION A: P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`₹${financialData.totalSales.toLocaleString()}`} 
          icon={<ShoppingBag className="text-emerald-500" />} 
          subText={`Sales Value (${timeFilter})`} 
        />
        <StatCard 
          title="Total Cost" 
          value={`₹${financialData.totalCost.toLocaleString()}`} 
          icon={<Fuel className="text-red-500" />} 
          subText="Birds + Ops + Payroll" 
        />
        <StatCard 
          title="Net Profit" 
          value={`₹${financialData.netProfit.toLocaleString()}`} 
          icon={<Zap className={`${financialData.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`} />} 
          subText="Adjusted Earnings" 
          colorClass={financialData.netProfit >= 0 ? "text-blue-600" : "text-red-600"}
        />
        <StatCard 
          title="Profit Margin" 
          value={`${financialData.profitMargin.toFixed(1)}%`} 
          icon={<TrendingUp className="text-purple-500" />} 
          subText="Return on Sales" 
          colorClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* SECTION B: Payment Recovery Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={16} className="text-blue-600" /> Cash Flow Statement</h4>
            
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-emerald-600">Collected: ₹{financialData.totalCollected.toLocaleString()}</span>
                <span className="text-red-500">Outstanding: ₹{financialData.pendingAmount.toLocaleString()}</span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-50">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out flex items-center justify-center text-[9px] text-white font-black"
                  style={{ width: `${financialData.totalSales > 0 ? (financialData.totalCollected / financialData.totalSales) * 100 : 0}%` }}
                >
                  {financialData.totalSales > 0 ? Math.round((financialData.totalCollected / financialData.totalSales) * 100) : 0}%
                </div>
                <div className="flex-1 bg-red-100 flex items-center justify-center text-[9px] text-red-500 font-black">
                  {financialData.totalSales > 0 ? Math.round((financialData.pendingAmount / financialData.totalSales) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Defaulter List (Priority Recovery)</h5>
              <div className="overflow-hidden border rounded-3xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase border-b">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4 text-center">Billed</th>
                      <th className="px-6 py-4 text-center">Received</th>
                      <th className="px-6 py-4 text-center">Pending</th>
                      <th className="px-6 py-4 text-right pr-8">Nudge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px] font-black">
                    {financialData.defaulters.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-slate-300 italic uppercase">No outstanding balances</td></tr>
                    ) : financialData.defaulters.slice(0, 6).map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="uppercase text-slate-900">{d.name}</p>
                          <p className="text-[8px] text-slate-400">Last: {d.lastPaymentDate}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 italic">₹{d.billed.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-emerald-600">₹{d.received.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-red-500 font-black">₹{d.pending.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right pr-8">
                          <button 
                            onClick={() => triggerWhatsApp(d.name, d.pending, d.contact)}
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                          >
                            <MessageCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: Expense Breakdown */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6 sticky top-10">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart size={16} className="text-red-500" /> Capital Breakdown</h4>
            
            <div className="space-y-8">
              {[
                { label: 'Procurement', amount: financialData.breakdown.procurement, color: 'bg-blue-600' },
                { label: 'Diesel (Fuel)', amount: financialData.breakdown.fuel, color: 'bg-red-500' },
                { label: 'Maintenance', amount: financialData.breakdown.maintenance, color: 'bg-orange-400' },
                { label: 'Staff & Wages', amount: financialData.breakdown.staff, color: 'bg-purple-500' }
              ].map((item, idx) => {
                const total = financialData.totalCost || 1;
                const pct = (item.amount / total) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-500 uppercase">{item.label}</p>
                      <p className="text-[11px] font-black text-slate-900">₹{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{pct.toFixed(1)}% of total cost</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-5 bg-slate-900 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency Insight</p>
                <p className="text-[11px] font-bold text-slate-100 italic leading-relaxed">
                  {financialData.breakdown.fuel > financialData.totalSales * 0.12 
                    ? "Diesel usage is peaking. Optimize delivery routes or check vehicle fuel logs." 
                    : "Overhead distribution is healthy. Continue current fleet maintenance cycle."}
                </p>
              </div>
              <Sparkles className="absolute -bottom-2 -right-2 text-white/5 group-hover:scale-150 transition-transform" size={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODULE 1: Procurement (Intake) ---

const ProcurementView: React.FC<{
  vehicles: Vehicle[];
  staff: Staff[];
  companies: Company[];
  onAddTrip: (trip: any) => void;
}> = ({ vehicles, staff, companies, onAddTrip }) => {
  const [routeBase, setRouteBase] = useState({ vehicleId: '', driverId: '', date: getTodayForInput() });
  const [stops, setStops] = useState<PickupStop[]>([]);
  const [currentStop, setCurrentStop] = useState<any>({ companyId: '', companyName: '', farmLocation: '', category: 'Fresh', weight: 0, quantity: 0, rate: 0 });

  const addStop = () => {
    if (!currentStop.companyId || !currentStop.weight) return;
    setStops([...stops, { ...currentStop, id: Math.random().toString(36).substr(2, 9) }]);
    setCurrentStop({ companyId: '', companyName: '', farmLocation: '', category: 'Fresh', weight: 0, quantity: 0, rate: 0 });
  };

  const handleTripFinalize = () => {
    if (!routeBase.vehicleId || stops.length === 0) return;
    onAddTrip({
      ...routeBase,
      stops,
      type: 'Pickup',
      date: new Date(routeBase.date).toLocaleDateString(),
      timestamp: new Date(routeBase.date).getTime()
    });
    setRouteBase({ vehicleId: '', driverId: '', date: getTodayForInput() });
    setStops([]);
  };

  const handleCompanySelect = (cid: string) => {
    const comp = companies.find(c => c.id === cid);
    if (comp) setCurrentStop({ ...currentStop, companyId: cid, companyName: comp.name, farmLocation: comp.location });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Truck size={16}/> Route Header</h4>
        
        <div className="space-y-4">
          <select className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={routeBase.vehicleId} onChange={e => setRouteBase({ ...routeBase, vehicleId: e.target.value })}>
            <option value="">Select Truck</option>
            {vehicles.filter(v => v.type === 'Pickup').map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
          </select>
          
          <select className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={routeBase.driverId} onChange={e => setRouteBase({ ...routeBase, driverId: e.target.value })}>
            <option value="">Select Driver</option>
            {staff.filter(s => s.role === 'Driver').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1.5"><Calendar size={10}/> Trip Date</label>
            <input 
              type="date" 
              className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none focus:bg-white focus:border-blue-500 transition-all" 
              value={routeBase.date} 
              onChange={e => setRouteBase({ ...routeBase, date: e.target.value })}
            />
          </div>
        </div>

        <button onClick={handleTripFinalize} className="mt-auto bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-2xl hover:bg-blue-600 transition-all">Log Inbound Trip</button>
      </div>

      <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={16}/> Farm Stop Builder</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.companyId} onChange={e => handleCompanySelect(e.target.value)}>
            <option value="">Select Company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.location})</option>)}
          </select>
          <select className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.category} onChange={e => setCurrentStop({ ...currentStop, category: e.target.value })}>
            {SHOP_LIVE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="number" placeholder="Weight (Kg)" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.weight || ''} onChange={e => setCurrentStop({ ...currentStop, weight: Number(e.target.value) })} />
          <input type="number" placeholder="Quantity" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.quantity || ''} onChange={e => setCurrentStop({ ...currentStop, quantity: Number(e.target.value) })} />
          <input type="number" placeholder="Purchase Rate (₹)" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.rate || ''} onChange={e => setCurrentStop({ ...currentStop, rate: Number(e.target.value) })} />
          <button onClick={addStop} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all">Add Stop</button>
        </div>

        <div className="border-2 border-dashed rounded-3xl p-6 min-h-[250px] space-y-4">
          {stops.length === 0 ? (
            <p className="text-center text-[10px] text-slate-300 font-black mt-20 uppercase tracking-widest">No stops defined for this trip</p>
          ) : stops.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border hover:border-blue-200 transition-all">
              <div>
                <p className="font-black text-sm uppercase text-slate-900">{s.companyName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.category} • {s.weight}KG • {s.quantity}birds • ₹{s.rate}/kg</p>
              </div>
              <button onClick={() => setStops(stops.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MODULE 2: Shop Delivery (Wholesale) ---

const ShopDeliveryView: React.FC<{
  vehicles: Vehicle[];
  staff: Staff[];
  clients: Client[];
  orders: CommercialOrder[];
  onAddTrip: (trip: any) => void;
}> = ({ vehicles, staff, clients, orders, onAddTrip }) => {
  const [routeBase, setRouteBase] = useState({ vehicleId: '', driverId: '', date: getTodayForInput() });
  const [stops, setStops] = useState<ShopStop[]>([]);
  const [currentStop, setCurrentStop] = useState<any>({ shopId: '', shopName: '', category: 'Fresh', weight: 0, quantity: 0, rate: 0 });

  const selectedDateString = useMemo(() => new Date(routeBase.date).toLocaleDateString(), [routeBase.date]);

  const todayDemand = useMemo(() => {
    return orders.filter(o => o.date === selectedDateString && o.clientType === 'Shop');
  }, [orders, selectedDateString]);

  const selectedShopDemand = useMemo(() => {
    if (!currentStop.shopName) return null;
    return todayDemand.find(d => d.clientName === currentStop.shopName);
  }, [currentStop.shopName, todayDemand]);

  const addStop = () => {
    if (!currentStop.shopName || !currentStop.weight) return;
    setStops([...stops, { ...currentStop, id: Math.random().toString(36).substr(2, 9) }]);
    setCurrentStop({ shopId: '', shopName: '', category: 'Fresh', weight: 0, quantity: 0, rate: 0 });
  };

  const copyDemandToDelivery = () => {
    if (!selectedShopDemand) return;
    const item = selectedShopDemand.items.find(i => i.type === currentStop.category);
    if (item) {
      setCurrentStop({ ...currentStop, weight: item.weight, quantity: item.quantity || 0 });
    }
  };

  const handleTripFinalize = () => {
    if (!routeBase.vehicleId || stops.length === 0) return;
    onAddTrip({
      ...routeBase,
      stops,
      type: 'ShopDelivery',
      date: selectedDateString,
      timestamp: new Date(routeBase.date).getTime()
    });
    setRouteBase({ vehicleId: '', driverId: '', date: getTodayForInput() });
    setStops([]);
  };

  const getActualDelivered = (shopName: string, category: string) => {
    const relevantStops = stops.filter(s => s.shopName === shopName && s.category === category);
    return {
      weight: relevantStops.reduce((sum, s) => sum + s.weight, 0),
      quantity: relevantStops.reduce((sum, s) => sum + (s.quantity || 0), 0)
    };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Store size={16}/> Route Header</h4>
          
          <div className="space-y-4">
            <select className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={routeBase.vehicleId} onChange={e => setRouteBase({ ...routeBase, vehicleId: e.target.value })}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
            </select>
            
            <select className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={routeBase.driverId} onChange={e => setRouteBase({ ...routeBase, driverId: e.target.value })}>
              <option value="">Select Driver</option>
              {staff.filter(s => s.role === 'Driver' || s.team === 'ShopDelivery').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1.5"><Calendar size={10}/> Delivery Date</label>
              <input 
                type="date" 
                className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                value={routeBase.date} 
                onChange={e => setRouteBase({ ...routeBase, date: e.target.value })}
              />
            </div>
          </div>

          <button onClick={handleTripFinalize} className="mt-auto bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-2xl hover:bg-emerald-600 transition-all">Log Wholesale Trip</button>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col gap-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={16}/> Shop Stop Builder</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <select className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.shopName} onChange={e => setCurrentStop({ ...currentStop, shopName: e.target.value })}>
                <option value="">Select Shop</option>
                {clients.filter(c => c.type === 'Shop').map(c => <option key={c.id} value={c.name}>{c.name} ({c.route})</option>)}
              </select>

              {selectedShopDemand && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={12}/> Demand Recorded</p>
                    <button onClick={copyDemandToDelivery} className="text-[9px] font-black bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Copy size={10}/> Copy Order</button>
                  </div>
                  <div className="flex gap-4">
                    {selectedShopDemand.items.map(i => (
                      <div key={i.type} className="text-blue-900">
                        <span className="text-[8px] font-bold uppercase opacity-50 block">{i.type}</span>
                        <span className="text-xs font-black">{i.quantity || 0} Birds / {i.weight} KG</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 h-fit">
              <select className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none col-span-2" value={currentStop.category} onChange={e => setCurrentStop({ ...currentStop, category: e.target.value })}>
                {SHOP_LIVE.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" placeholder="Qty (Birds)" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.quantity || ''} onChange={e => setCurrentStop({ ...currentStop, quantity: Number(e.target.value) })} />
              <input type="number" placeholder="Weight (Kg)" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none" value={currentStop.weight || ''} onChange={e => setCurrentStop({ ...currentStop, weight: Number(e.target.value) })} />
              <input type="number" placeholder="Sale Rate (₹)" className="p-4 border rounded-2xl bg-slate-50 font-black text-xs outline-none col-span-2" value={currentStop.rate || ''} onChange={e => setCurrentStop({ ...currentStop, rate: Number(e.target.value) })} />
              <button onClick={addStop} className="col-span-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 transition-all">Add Stop to Truck</button>
            </div>
          </div>

          <div className="border-2 border-dashed rounded-3xl p-6 min-h-[150px] space-y-4">
            {stops.length === 0 ? (
              <p className="text-center text-[10px] text-slate-300 font-black mt-12 uppercase tracking-widest">No shop stops defined for current trip</p>
            ) : stops.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border hover:border-emerald-200 transition-all">
                <div>
                  <p className="font-black text-sm uppercase text-slate-900">{s.shopName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.category} • {s.quantity || 0} birds • {s.weight}KG • ₹{s.rate}/kg</p>
                </div>
                <button onClick={() => setStops(stops.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wholesale Reconciliation View */}
      <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Wholesale Reconciliation ({selectedDateString})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                <th className="px-8 py-6 border-r bg-slate-50 text-slate-500" rowSpan={2}>SHOP NAME</th>
                <th className="px-8 py-4 text-center bg-blue-50 border-r text-blue-600 border-t-4 border-t-blue-400" colSpan={3}>ORDER VIEW (OWNER)</th>
                <th className="px-8 py-4 text-center bg-slate-50/20 border-r text-slate-900 border-t-4 border-t-slate-300" colSpan={3}>DELIVERY VIEW (ACTUALS)</th>
                <th className="px-8 py-6 text-center border-l bg-slate-50 text-slate-500" rowSpan={2}>COMPLIANCE</th>
              </tr>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                {SHOP_LIVE.map(cat => <th key={`o-${cat}`} className="px-4 py-4 text-center bg-blue-50/50 border-r">{cat}<br/>(BIRDS/KG)</th>)}
                {SHOP_LIVE.map(cat => <th key={`d-${cat}`} className="px-4 py-4 text-center bg-slate-50/10 border-r text-slate-600">{cat}<br/>(BIRDS/KG)</th>)}
              </tr>
            </thead>
            <tbody className="divide-y text-[11px] font-black">
              {todayDemand.length === 0 ? (
                <tr><td colSpan={8} className="p-24 text-center text-slate-300 uppercase tracking-widest">No shop demand found for {selectedDateString}</td></tr>
              ) : todayDemand.map(order => {
                let allFulfilled = true;
                const rowData = SHOP_LIVE.map(cat => {
                  const orderedItem = order.items.find(i => i.type === cat);
                  const actual = getActualDelivered(order.clientName, cat);
                  if ((orderedItem?.weight || 0) > 0 && actual.weight < ((orderedItem?.weight || 0) * 0.95)) allFulfilled = false;
                  return { ordered: orderedItem, actual };
                });

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6 border-r uppercase text-slate-900 font-black bg-white group-hover:bg-slate-50">{order.clientName}</td>
                    {rowData.map((data, idx) => (
                      <td key={`o-cell-${idx}`} className="px-4 py-6 text-center bg-blue-50/20 border-r text-blue-600/70">
                        {data.ordered ? <div className="flex flex-col gap-0.5"><span>{data.ordered.quantity} B</span><span className="opacity-50">{data.ordered.weight} K</span></div> : '-'}
                      </td>
                    ))}
                    {rowData.map((data, idx) => (
                      <td key={`d-cell-${idx}`} className={`px-4 py-6 text-center border-r text-slate-900`}>
                        {data.ordered ? <div className="flex flex-col gap-0.5"><span>{data.actual.quantity} B</span><span className="opacity-70">{data.actual.weight} K</span></div> : '-'}
                      </td>
                    ))}
                    <td className="px-8 py-6 text-center border-l bg-slate-50/30">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] uppercase shadow-sm ${allFulfilled ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'}`}>
                        {allFulfilled ? <Check size={12}/> : <AlertCircle size={12}/>} {allFulfilled ? 'Complete' : 'Short Ship'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.Owner);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  // Database States
  const [heavyRoutes, setHeavyRoutes] = useState<HeavyRoute[]>([]);
  const [orders, setOrders] = useState<CommercialOrder[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [prices, setPrices] = useState<DailyPrices>(INITIAL_PRICES);
  const [clients, setClients] = useState<Client[]>([
    { id: 'c1', name: 'Hotel Radhika', type: 'Hotel', location: 'City', balanceDue: 4500, route: 'City Center', contact: '9123456780' },
    { id: 'c2', name: 'Paradise Inn', type: 'Hotel', location: 'Uptown', balanceDue: 1200, route: 'Nashik Road', contact: '9123456781' },
    { id: 'c3', name: 'Zeeshan Shop', type: 'Shop', location: 'Market', balanceDue: 0, route: 'City Center', contact: '9123456782' },
    { id: 'c4', name: 'Noor Chicken', type: 'Shop', location: 'Cross', balanceDue: 0, route: 'Hadapsar', contact: '9123456783' }
  ]);
  const [companies, setCompanies] = useState<Company[]>([
    { id: 'comp1', name: 'Skylark', location: 'Wadki Unit' },
    { id: 'comp2', name: 'Premium', location: 'Farm A' }
  ]);
  const [staff] = useState<Staff[]>([
    { id: 's1', name: 'Tabrez', role: 'Manager', salary: 25000 },
    { id: 's2', name: 'Nawaz', role: 'Manager', salary: 22000 },
    { id: 's3', name: 'Saddam', role: 'Manager', salary: 20000 },
    { id: 's4', name: 'Sadiq', role: 'DeliveryBoy', salary: 15000, team: 'ShopDelivery' },
    { id: 's5', name: 'Imran', role: 'DeliveryBoy', salary: 15000, team: 'ShopDelivery' },
    { id: 's6', name: 'Navya', role: 'DeliveryBoy', salary: 15000, team: 'HotelDelivery' },
    { id: 's7', name: 'Mushtaq', role: 'Cutter', salary: 14000, team: 'Cutting' },
    { id: 's8', name: 'Yousuf', role: 'Driver', salary: 18000 }
  ]);
  const [vehicles] = useState<Vehicle[]>([{ id: 'v1', name: 'Eicher-704', type: 'Pickup', plate: 'KA-01-9988' }, { id: 'v2', name: 'TataAce-01', type: 'Pickup', plate: 'KA-01-2233' }]);

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  const placeOrder = (base: any) => {
    const existingIdx = orders.findIndex(o => o.clientName === base.clientName && o.date === base.date);
    if (existingIdx > -1) {
      const updated = [...orders];
      updated[existingIdx] = { ...updated[existingIdx], items: base.items };
      setOrders(updated);
    } else {
      setOrders([{ 
        ...base, 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: Date.now(), 
        status: base.clientType === 'Hotel' ? OrderStatus.PendingCutting : OrderStatus.PendingLoad, 
        paymentStatus: PaymentStatus.Unpaid, totalAmount: 0 
      }, ...orders]);
    }
  };

  const updateOrderRate = (orderId: string, itemIdx: number, rate: number) => {
    setOrders(orders.map(o => {
      if (o.id !== orderId) return o;
      const newItems = [...o.items];
      newItems[itemIdx] = { ...newItems[itemIdx], sellingRate: rate };
      return { ...o, items: newItems };
    }));
  };

  const updateOrderActuals = (orderId: string, itemIdx: number, actualWeight: number) => {
    setOrders(orders.map(o => {
      if (o.id !== orderId) return o;
      const newItems = [...o.items];
      newItems[itemIdx] = { ...newItems[itemIdx], actualWeight };
      return { ...o, items: newItems };
    }));
  };

  const updateHeavyRate = (routeId: string, stopId: string, rate: number) => {
    setHeavyRoutes(heavyRoutes.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, stops: r.stops.map(s => s.id === stopId ? { ...s, rate } : s) };
    }));
  };

  const metrics: MetricData = useMemo(() => {
    const totalPickups = heavyRoutes.filter(r => r.type === 'Pickup').flatMap(r => r.stops as PickupStop[]).reduce((s, st) => s + st.weight, 0);
    const totalShopSales = heavyRoutes.filter(r => r.type === 'ShopDelivery').flatMap(r => r.stops as ShopStop[]).reduce((s, st) => s + st.weight, 0);
    const totalHotelSales = orders.filter(o => o.status === OrderStatus.Delivered).reduce((s, o) => s + o.items.reduce((sum, i) => sum + (i.actualWeight || i.weight), 0), 0);
    const revenue = orders.filter(o => o.status === OrderStatus.Delivered).reduce((s, o) => s + (o.amountCollected || 0), 0) + 
                    heavyRoutes.filter(r => r.type === 'ShopDelivery').flatMap(r => r.stops as ShopStop[]).reduce((s, st) => s + (st.weight * st.rate), 0);
    const procurementCost = heavyRoutes.filter(r => r.type === 'Pickup').flatMap(r => r.stops as PickupStop[]).reduce((s, st) => s + (st.weight * st.rate), 0);
    const opExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    return { 
      netProfit: revenue - procurementCost - opExpenses - 5000, 
      yieldPercentage: totalPickups > 0 ? ((totalShopSales + totalHotelSales) / totalPickups) * 100 : 0, 
      totalSalesRevenue: revenue, 
      totalExpenses: procurementCost + opExpenses + 5000, 
      shrinkage: totalPickups - (totalShopSales + totalHotelSales),
      liveStock: Math.max(0, totalPickups - totalShopSales - totalHotelSales),
      cashInHand: revenue
    };
  }, [heavyRoutes, orders, expenses]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="text-center"><Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} /><p className="text-white font-black uppercase tracking-widest text-[10px]">Morning Sync Active...</p></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-black uppercase tracking-tight">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-8 border-b border-slate-800"><h1 className="text-xl font-black text-blue-400 italic">Raza Boiler</h1><p className="text-[9px] text-slate-500 mt-1 uppercase tracking-[0.2em]">Distribution Engine</p></div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.filter(n => !n.roles || n.roles.includes(role)).map(n => (
            <SidebarItem key={n.id} icon={n.icon} label={n.label} active={activeTab === n.id} onClick={() => setActiveTab(n.id)} />
          ))}
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-2xl border border-slate-700/50">
          <select className="w-full bg-slate-900 text-[9px] font-black p-2 rounded border border-slate-700 text-slate-300 uppercase outline-none focus:border-blue-500" value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value={Role.Owner}>Owner</option>
            <option value={Role.Accounts}>Saddam (Accounts)</option>
            <option value={Role.Manager}>Tabrez (Manager)</option>
            <option value={Role.Delivery}>Navya (Delivery)</option>
          </select>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
          <h2 className="text-lg font-black text-slate-700 tracking-[0.15em] uppercase italic">{activeTab.replace('_', ' ')}</h2>
          <div className="flex gap-8">
             <div className="text-right"><span className="text-[9px] text-slate-400 font-black">LIVE STOCK</span><p className="text-base font-black text-emerald-600">{metrics.liveStock.toFixed(0)} KG</p></div>
             <div className="text-right border-l pl-8"><span className="text-[9px] text-slate-400 font-black">CASH IN HAND</span><p className="text-base font-black text-blue-600">₹{metrics.cashInHand.toLocaleString()}</p></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
              <StatCard title="Net Profit" value={`₹${metrics.netProfit.toLocaleString()}`} icon={<ArrowUpRight className="text-green-500" />} subText="Daily Adjusted" colorClass="text-green-600" />
              <StatCard title="Total Yield" value={`${metrics.yieldPercentage.toFixed(1)}%`} icon={<TrendingDown className="text-amber-500" />} subText="Efficiency" />
              <StatCard title="Sales Revenue" value={`₹${metrics.totalSalesRevenue.toLocaleString()}`} icon={<ShoppingBag className="text-blue-500" />} subText="All Collection" />
              <StatCard title="Overheads" value={`₹${metrics.totalExpenses.toLocaleString()}`} icon={<Fuel className="text-red-500" />} subText="Fleet Cost" colorClass="text-red-500" />
            </div>
          )}
          {activeTab === 'reports' && <ReportsView orders={orders} heavyRoutes={heavyRoutes} expenses={expenses} clients={clients} staff={staff} />}
          {activeTab === 'order_command' && <OrderCommandCenter clients={clients} orders={orders} onPlaceOrder={placeOrder} />}
          {activeTab === 'procurement' && <ProcurementView vehicles={vehicles} staff={staff} companies={companies} onAddTrip={r => setHeavyRoutes([r, ...heavyRoutes])} />}
          {activeTab === 'shop_delivery' && <ShopDeliveryView vehicles={vehicles} staff={staff} clients={clients} orders={orders} onAddTrip={r => setHeavyRoutes([r, ...heavyRoutes])} />}
        </div>
      </main>
    </div>
  );
};

// --- Missing Internal Components for Full File Export ---
const OrderCommandCenter: React.FC<any> = ({ clients, orders, onPlaceOrder }) => {
  const [activeTab, setActiveTab] = useState<'Hotel' | 'Shop'>('Hotel');
  const [inputs, setInputs] = useState<Record<string, Record<string, { weight: number; quantity?: number }>>>({});

  const handleSave = (client: Client) => {
    const clientInputs = inputs[client.id] || {};
    const items = Object.entries(clientInputs)
      .filter(([_, data]) => (data.weight || 0) > 0)
      .map(([type, data]) => ({ type, weight: data.weight, quantity: data.quantity || 0, sellingRate: 0 }));

    if (items.length === 0) return;
    onPlaceOrder({ clientName: client.name, clientType: client.type, items, date: new Date().toLocaleDateString() });
  };

  const itemTypes = activeTab === 'Hotel' ? HOTEL_CUTS : SHOP_LIVE;

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Post Daily Demand</h3>
        <div className="flex bg-slate-200 p-1 rounded-xl">
           <button onClick={() => setActiveTab('Hotel')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'Hotel' ? 'bg-white text-blue-600' : 'text-slate-500'}`}>Hotel</button>
           <button onClick={() => setActiveTab('Shop')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'Shop' ? 'bg-white text-blue-600' : 'text-slate-500'}`}>Shop</button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] text-slate-400 font-black border-b">
          <tr>
            <th className="px-10 py-5">Client Name</th>
            {itemTypes.map(t => <th key={t} className="px-6 py-5 text-center">{t}</th>)}
            <th className="px-10 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y text-xs font-black">
          {clients.filter((c: any) => c.type === activeTab).map((client: any) => (
            <tr key={client.id} className="hover:bg-slate-50">
              <td className="px-10 py-6 uppercase">{client.name}</td>
              {itemTypes.map(type => (
                <td key={type} className="px-6 py-4 text-center">
                   <div className="flex gap-1 justify-center">
                     {activeTab === 'Shop' && (
                       <input 
                        type="number" placeholder="Qty" className="w-14 p-2 border rounded-xl text-center bg-slate-50 font-black"
                        onChange={e => setInputs({...inputs, [client.id]: {...(inputs[client.id]||{}), [type]: {...(inputs[client.id]?.[type]||{}), quantity: parseFloat(e.target.value)}}})}
                       />
                     )}
                     <input 
                      type="number" placeholder="Kg" className="w-16 p-2 border rounded-xl text-center bg-slate-50 font-black"
                      onChange={e => setInputs({...inputs, [client.id]: {...(inputs[client.id]||{}), [type]: {...(inputs[client.id]?.[type]||{}), weight: parseFloat(e.target.value)}}})}
                     />
                   </div>
                </td>
              ))}
              <td className="px-10 py-4 text-right">
                <button onClick={() => handleSave(client)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"><Send size={12} className="inline mr-1" /> Post</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
