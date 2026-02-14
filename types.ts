
export enum Role {
  Owner = 'Owner',
  Manager = 'Manager', // Tabrez
  HotelManager = 'HotelManager', // Nawaz
  Delivery = 'Delivery', // Navya
  Accounts = 'Accounts' // Saddam
}

export enum OrderStatus {
  PendingCutting = 'Pending Cutting',
  PendingLoad = 'Pending Load',
  ReadyForDelivery = 'Ready for Delivery',
  Delivered = 'Delivered'
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Cash = 'Cash',
  Online = 'Online',
  Partial = 'Partial Payment',
  Credit = 'Credit/Hold'
}

export enum ExpenseType {
  Fuel = 'Diesel',
  Maintenance = 'Maintenance/Repair',
  Allowance = 'Driver Allowance'
}

export interface ExpenseEntry {
  id: string;
  type: ExpenseType;
  amount: number;
  note: string;
  date: string;
  timestamp: number;
  vehicleId?: string;
  driverId?: string;
  category: 'operational_expense';
}

export interface OrderItem {
  type: string;
  weight: number;
  quantity?: number;
  sellingRate?: number; // Specific rate for this order/stop
  actualWeight?: number; // For reconciliation (Planned vs Actual)
}

export interface CommercialOrder {
  id: string;
  clientName: string;
  clientType: 'Hotel' | 'Shop';
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  date: string;
  timestamp: number;
  totalAmount: number;
  assignedDeliveryBoyId?: string;
  amountCollected?: number;
}

export interface PickupStop {
  id: string;
  companyName: string;
  farmLocation: string;
  category: 'Fresh' | 'Lame' | 'Tandoor';
  weight: number;
  quantity: number;
  rate: number; // Purchase Rate
}

export interface ShopStop {
  id: string;
  shopName: string;
  category: string;
  weight: number;
  quantity: number;
  rate: number; // Selling Rate
}

export interface HeavyRoute {
  id: string;
  type: 'Pickup' | 'ShopDelivery';
  vehicleId: string;
  driverId: string;
  stops: (PickupStop | ShopStop)[];
  date: string;
  timestamp: number;
}

export interface HotelDeliveryRoute {
  id: string;
  driverId: string;
  orderIds: string[];
  status: 'Active' | 'Completed';
  date: string;
  timestamp: number;
}

export interface MetricData {
  netProfit: number;
  yieldPercentage: number;
  totalSalesRevenue: number;
  totalExpenses: number;
  shrinkage: number;
  liveStock: number;
  cashInHand: number;
}

export interface DailyPrices {
  inPrice: number;
  outPriceHotel: number;
  outPriceShop: number;
  itemRates: Record<string, number>;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Pickup' | 'Bike' | 'Other';
  plate: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Driver' | 'Cutter' | 'Loader' | 'Manager' | 'DeliveryBoy';
  salary: number;
  team?: 'Cutting' | 'HotelDelivery' | 'ShopDelivery';
}

export interface Client {
  id: string;
  name: string;
  type: 'Hotel' | 'Shop';
  location: string;
  balanceDue: number; // For the "Saddam Connection"
  contact?: string;
  route?: string;
  rateGroup?: 'Premium' | 'Standard';
}

export interface Company {
  id: string;
  name: string;
  location: string;
  contactPerson?: string;
  contactNumber?: string;
}
