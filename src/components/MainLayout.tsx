import React from "react";

type Props = {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigate: (route: string) => void;
  active?: string;
  user?: any;
};

const MainLayout = ({ children, onLogout, onNavigate, active, user }: Props) => {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">RAZA BOILER</h2>
          <p className="text-sm text-slate-500">Welcome, {user?.name || "User"}</p>
        </div>

        <nav className="space-y-0.5">
          <button
            onClick={() => onNavigate("home")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "home" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            Dashboard
          </button>

          <div className="mt-4 mb-2">
            <p className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider">Masters</p>
          </div>

          <button
            onClick={() => onNavigate("users")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "users" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            1. User Master
          </button>

          <button
            onClick={() => onNavigate("companies")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "companies" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            2. Company Master
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "customers" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            3. Customer Master
          </button>

          <button
            onClick={() => onNavigate("items")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "items" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            4. Item Master
          </button>

          <button
            onClick={() => onNavigate("sales")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "sales" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            5. Sales Master
          </button>

          <button
            onClick={() => onNavigate("purchase")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "purchase" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            6. Purchase Master
          </button>

          <button
            onClick={() => onNavigate("orders")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "orders" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            7. Order Master
          </button>

          <button
            onClick={() => onNavigate("vehicles")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "vehicles" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            8. Vehicle Master
          </button>

          <button
            onClick={() => onNavigate("maintenance")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "maintenance" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            9. Maintenance Master
          </button>

          <button
            onClick={() => onNavigate("route-builder")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "route-builder" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
          >
            10. Route Builder
          </button>
        </nav>

        <div className="mt-6">
          <button onClick={onLogout} className="w-full bg-slate-900 text-white py-2 rounded-md">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default MainLayout;
