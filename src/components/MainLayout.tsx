import React, { useState } from "react";

type Props = {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigate: (route: string) => void;
  active?: string;
  user?: any;
};

const MainLayout = ({ children, onLogout, onNavigate, active, user }: Props) => {
  const [dailyOpen, setDailyOpen] = useState(true);
  const [masterOpen, setMasterOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);

  const sectionButtonClass =
    "w-full text-left px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-slate-50 flex items-center justify-between";

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

          <div className="mt-4">
            <button
              type="button"
              className={sectionButtonClass}
              onClick={() => setDailyOpen((v) => !v)}
              aria-expanded={dailyOpen}
            >
              Daily Activity
              <span>{dailyOpen ? "−" : "+"}</span>
            </button>
          </div>

          {dailyOpen && (
            <>
              <button
                onClick={() => onNavigate("orders")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "orders" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Order
              </button>

              <button
                onClick={() => onNavigate("route-builder")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "route-builder" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Route
              </button>

              <button
                onClick={() => onNavigate("sales")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "sales" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Sale
              </button>
            </>
          )}

          <div className="mt-4">
            <button
              type="button"
              className={sectionButtonClass}
              onClick={() => setMasterOpen((v) => !v)}
              aria-expanded={masterOpen}
            >
              Master
              <span>{masterOpen ? "−" : "+"}</span>
            </button>
          </div>

          {masterOpen && (
            <>
              <button
                onClick={() => onNavigate("users")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "users" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                User
              </button>

              <button
                onClick={() => onNavigate("companies")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "companies" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Company
              </button>

              <button
                onClick={() => onNavigate("customers")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "customers" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Customer
              </button>

              <button
                onClick={() => onNavigate("vehicles")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "vehicles" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Vehicle
              </button>

              <button
                onClick={() => onNavigate("items")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "items" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Item
              </button>
            </>
          )}

          <div className="mt-4">
            <button
              type="button"
              className={sectionButtonClass}
              onClick={() => setReportsOpen((v) => !v)}
              aria-expanded={reportsOpen}
            >
              Reports
              <span>{reportsOpen ? "−" : "+"}</span>
            </button>
          </div>

          {reportsOpen && (
            <>
              <button
                onClick={() => onNavigate("sales-reports")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "sales-reports" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Sales Reports
              </button>

              <button
                onClick={() => onNavigate("purchase-reports")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === "purchase-reports" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                Purchase Reports
              </button>
            </>
          )}
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
