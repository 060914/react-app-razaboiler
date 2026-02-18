import React from "react";
import { Wrench } from "lucide-react";

const MaintenanceMaster = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-600 rounded-lg text-white">
          <Wrench size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Maintenance Master</h1>
          <p className="text-slate-500 text-sm">Coming soon...</p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <p className="text-slate-600">Maintenance Master module will be available soon.</p>
      </div>
    </div>
  );
};

export default MaintenanceMaster;
