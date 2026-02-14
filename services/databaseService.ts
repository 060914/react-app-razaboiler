const API_BASE = 'http://localhost:5000/api';

// ===== TYPE DEFINITIONS =====
export interface ClientResponse {
  id: string;
  name: string;
  type: 'Hotel' | 'Shop';
  location: string;
  route: string;
  contact: string;
  balance_due: number;
}

export interface CompanyResponse {
  id: string;
  name: string;
  location: string;
  contact?: string;
}

export interface StaffResponse {
  id: string;
  name: string;
  role: string;
  team?: string;
  salary: number;
}

export interface VehicleResponse {
  id: string;
  name: string;
  type: string;
  plate: string;
  capacity?: number;
}

export interface OrderResponse {
  id: string;
  clientName: string;
  clientId: string;
  clientType: string;
  order_date: string;
  timestamp: number;
  status: string;
  payment_status: string;
  items: Array<{
    id: string;
    type: string;
    weight: number;
    quantity: number;
    sellingRate: number;
    actualWeight?: number;
  }>;
}

export interface ExpenseResponse {
  id: string;
  type: string;
  amount: number;
  description?: string;
  staff_id?: string;
  vehicle_id?: string;
  expense_date: string;
  timestamp: number;
}

// ===== CLIENTS API =====
export const clientsAPI = {
  getAll: async (): Promise<ClientResponse[]> => {
    const res = await fetch(`${API_BASE}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  create: async (client: Omit<ClientResponse, 'id'>): Promise<ClientResponse> => {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
  },

  update: async (id: string, client: Omit<ClientResponse, 'id'>): Promise<void> => {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!res.ok) throw new Error('Failed to update client');
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
  }
};

// ===== COMPANIES API =====
export const companiesAPI = {
  getAll: async (): Promise<CompanyResponse[]> => {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
  },

  create: async (company: Omit<CompanyResponse, 'id'>): Promise<CompanyResponse> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    if (!res.ok) throw new Error('Failed to create company');
    return res.json();
  },

  update: async (id: string, company: Omit<CompanyResponse, 'id'>): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    if (!res.ok) throw new Error('Failed to update company');
  }
};

// ===== STAFF API =====
export const staffAPI = {
  getAll: async (): Promise<StaffResponse[]> => {
    const res = await fetch(`${API_BASE}/staff`);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  create: async (staff: Omit<StaffResponse, 'id'>): Promise<StaffResponse> => {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff)
    });
    if (!res.ok) throw new Error('Failed to create staff');
    return res.json();
  }
};

// ===== VEHICLES API =====
export const vehiclesAPI = {
  getAll: async (): Promise<VehicleResponse[]> => {
    const res = await fetch(`${API_BASE}/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  },

  create: async (vehicle: Omit<VehicleResponse, 'id'>): Promise<VehicleResponse> => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) throw new Error('Failed to create vehicle');
    return res.json();
  }
};

// ===== ORDERS API =====
export const ordersAPI = {
  getAll: async (): Promise<OrderResponse[]> => {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  create: async (order: any): Promise<OrderResponse> => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  update: async (id: string, updates: any): Promise<void> => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update order');
  }
};

// ===== HEAVY ROUTES API =====
export const heavyRoutesAPI = {
  getAll: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/heavy-routes`);
    if (!res.ok) throw new Error('Failed to fetch heavy routes');
    return res.json();
  },

  create: async (route: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/heavy-routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route)
    });
    if (!res.ok) throw new Error('Failed to create heavy route');
    return res.json();
  }
};

// ===== EXPENSES API =====
export const expensesAPI = {
  getAll: async (): Promise<ExpenseResponse[]> => {
    const res = await fetch(`${API_BASE}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  create: async (expense: any): Promise<ExpenseResponse> => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Failed to create expense');
    return res.json();
  }
};

// ===== SYNC API (Fetch all master data at once) =====
export const syncAPI = {
  getAll: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/sync`);
    if (!res.ok) throw new Error('Failed to sync data');
    return res.json();
  }
};

// ===== ERROR HANDLER =====
export const handleAPIError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
