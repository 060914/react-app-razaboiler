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
    "w-full text-left px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between";

  const parentButtonClass = (isActive?: boolean) =>
    `w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:text-white hover:bg-white/5"
    }`;

  const childButtonClass = (isActive?: boolean) =>
    `w-full text-left px-3 py-2 rounded-xl text-sm pl-10 ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-r border-slate-800/60 p-4 rounded-tr-3xl rounded-br-3xl shadow-2xl shadow-slate-900/30">
        <div className="mb-6 px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 text-sm font-black">
              RB
            </span>
            RAZA BOILER
          </h2>
          <p className="text-sm text-slate-400 mt-1">Welcome, {user?.name || "User"}</p>
        </div>

        <nav className="space-y-1">
          <button onClick={() => onNavigate("home")} className={parentButtonClass(active === "home")}>
            <span className="text-lg leading-none">▦</span>
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
              <span className="text-base">{dailyOpen ? "-" : "+"}</span>
            </button>
          </div>

          {dailyOpen && (
            <>
              <button onClick={() => onNavigate("orders")} className={childButtonClass(active === "orders")}>
                Order
              </button>

              <button
                onClick={() => onNavigate("route-builder")}
                className={childButtonClass(active === "route-builder")}
              >
                Route
              </button>

              <button onClick={() => onNavigate("sales")} className={childButtonClass(active === "sales")}>
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
              <span className="text-base">{masterOpen ? "-" : "+"}</span>
            </button>
          </div>

          {masterOpen && (
            <>
              <button onClick={() => onNavigate("users")} className={childButtonClass(active === "users")}>
                User
              </button>

              <button onClick={() => onNavigate("companies")} className={childButtonClass(active === "companies")}>
                Company
              </button>

              <button onClick={() => onNavigate("customers")} className={childButtonClass(active === "customers")}>
                Customer
              </button>

              <button onClick={() => onNavigate("vehicles")} className={childButtonClass(active === "vehicles")}>
                Vehicle
              </button>

              <button onClick={() => onNavigate("items")} className={childButtonClass(active === "items")}>
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
              <span className="text-base">{reportsOpen ? "-" : "+"}</span>
            </button>
          </div>

          {reportsOpen && (
            <>
              <button
                onClick={() => onNavigate("sales-reports")}
                className={childButtonClass(active === "sales-reports")}
              >
                Sales Reports
              </button>

              <button
                onClick={() => onNavigate("purchase-reports")}
                className={childButtonClass(active === "purchase-reports")}
              >
                Purchase Reports
              </button>
            </>
          )}
        </nav>

        <div className="mt-6 px-2">
          <button
            onClick={onLogout}
            className="w-full bg-white/10 text-white font-semibold py-2 rounded-xl hover:bg-white/20 border border-white/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default MainLayout;
