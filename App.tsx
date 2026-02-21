import { useState } from "react";
import LoginScreen from "./src/pages/Login";
import MainLayout from "./src/components/MainLayout";
import UserMaster from "./src/pages/UserMaster";
import CompanyMaster from "./src/pages/CompanyMaster";
import CustomerMaster from "./src/pages/CustomerMaster";
import ItemMaster from "./src/pages/ItemMaster";
import SalesMaster from "./src/pages/SalesMaster";
import PurchaseMaster from "./src/pages/PurchaseMaster";
import OrderMaster from "./src/pages/OrderMaster";
import VehicleMaster from "./src/pages/VehicleMaster";
import MaintenanceMaster from "./src/pages/MaintenanceMaster";
import RouteBuilder from "./src/pages/RouteBuilder";
import { getCookie, removeCookie } from "./src/utils/cookieHelper";

function App() {
  const [user, setUser] = useState<any>(
    getCookie("auth_token") ? {} : null
  );

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    removeCookie("auth_token");
    setUser(null);
  };

  const [route, setRoute] = useState<string>("home");

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <MainLayout onLogout={handleLogout} onNavigate={setRoute} active={route} user={user}>
      {route === "home" && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-600">Select a master from the sidebar to get started.</p>
        </div>
      )}

      {route === "users" && <UserMaster />}
      {route === "companies" && <CompanyMaster />}
      {route === "customers" && <CustomerMaster />}
      {route === "items" && <ItemMaster />}
      {route === "sales" && <SalesMaster />}
      {route === "purchase" && <PurchaseMaster />}
      {route === "orders" && <OrderMaster />}
      {route === "vehicles" && <VehicleMaster />}
      {route === "maintenance" && <MaintenanceMaster />}
      {route === "route-builder" && <RouteBuilder />}
    </MainLayout>
  );
}

export default App;
