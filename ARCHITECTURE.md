# RAZA BOILER - COMPLETE DATABASE INTEGRATION

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│              App.tsx (Dashboard, Orders, Routes)             │
│                                                               │
│  - Clients: Hotel Radhika, Paradise Inn, Noor Shop, etc.    │
│  - Companies: Skylark, Premium                              │
│  - Staff: Tabrez, Nawaz, Yousuf, Navya, etc.               │
│  - Vehicles: Eicher-704, TataAce-01                         │
│  - Orders with Items (Fresh, Broiler, Collections)          │
│  - Routes (Pickup, Shop Delivery, Hotel Delivery)           │
│  - Expenses (Fuel, Maintenance, Allowance)                  │
│  - Real-time Financial Dashboard                            │
└─────────────────────────────────────────────────────────────┘
                            ↕️
              databaseService.ts API Calls
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                        │
│              server.js (Port 5000)                           │
│                                                               │
│  ✓ GET /api/clients, /api/orders, /api/routes              │
│  ✓ POST /api/clients, /api/orders, /api/routes             │
│  ✓ PUT /api/orders/:id (Update status/payment)             │
│  ✓ GET /api/sync (Master data sync)                        │
│  ✓ Full CRUD for all entities                              │
│  ✓ Connection pooling for performance                       │
│  ✓ UUID generation for unique IDs                          │
└─────────────────────────────────────────────────────────────┘
                            ↕️
                    MySQL Connection
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (razaboiler)                       │
│                                                               │
│  MASTER DATA:          │  TRANSACTIONS:    │  SUMMARY:      │
│  ├─ clients            │  ├─ orders        │  ├─ daily_     │
│  ├─ companies          │  ├─ order_items   │  │   prices    │
│  ├─ staff              │  ├─ heavy_routes  │  └─ daily_     │
│  ├─ vehicles           │  ├─ route_stops   │      summary    │
│  └─ daily_prices       │  ├─ expenses      │                 │
│                        │  └─ payments      │                 │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Tables (12 Total)

### Master Data (Reference)
```sql
clients (4 records)
  - Hotel Radhika, Paradise Inn, Zeeshan Shop, Noor Chicken

companies (2 records)
  - Skylark (Wadki Unit), Premium (Farm A)

staff (8 records)
  - Managers: Tabrez, Nawaz, Saddam
  - Drivers: Yousuf
  - Delivery: Sadiq, Imran, Navya
  - Cutter: Mushtaq

vehicles (2 records)
  - Eicher-704 (5000kg), TataAce-01 (3000kg)
```

### Transactional Data
```sql
commercial_orders
  - client_id, client_type, amount_collected, status, payment_status
  - Example: Order from Hotel Radhika on 2026-02-07

order_items
  - type (Fresh/Broiler/Collection), weight, quantity, selling_rate
  - Links to commercial_orders

heavy_routes
  - type (Pickup/ShopDelivery/HotelDelivery)
  - vehicle_id, driver_id, timestamp
  - Example: Pickup route to Skylark Farm

route_stops
  - stop_order, category, weight, quantity, rate
  - Links to heavy_routes
  - company_id (for pickups) or client_id (for deliveries)

expenses
  - type (Fuel/Maintenance/Allowance), amount
  - vehicle_id, staff_id, expense_date
  - Example: ₹1500 diesel for Eicher-704

payments
  - order_id, client_id, amount, payment_date, method
  - Links orders to payment records
```

### Configuration
```sql
daily_prices
  - fresh_rate, broiler_rate, collection_rate
  - price_date (unique per day)

daily_summary
  - total_sales, total_cost, net_profit, collected, pending
  - Recalculated daily for performance
```

## 🚀 Complete Setup Steps

### 1️⃣ IMPORT DATABASE
```bash
# Method 1: phpMyAdmin (GUI)
# http://localhost/phpmyadmin → Import → database.sql

# Method 2: Command Line
mysql -u root -p < database.sql
```

### 2️⃣ BACKEND SETUP
```bash
cd backend
npm install
node server.js
```
✓ Should show: "Backend running on http://localhost:3000"

### 3️⃣ FRONTEND SETUP (NEW TERMINAL)
```bash
npm install
npm run dev
```
✓ Should show: "Local: http://localhost:5173/"

### 4️⃣ VERIFY IN BROWSER
- Open http://localhost:5173
- Should load dashboard with data from database
- If error: Check backend is running

## 📡 API Endpoints

### Clients
```
GET  /api/clients              → List all clients
POST /api/clients              → Create new client
PUT  /api/clients/:id          → Update client
DEL  /api/clients/:id          → Delete client
```

### Orders
```
GET  /api/orders               → List with items (JSON)
POST /api/orders               → Create order + items
PUT  /api/orders/:id           → Update status/payment
```

### Heavy Routes
```
GET  /api/heavy-routes         → List with stops (JSON)
POST /api/heavy-routes         → Create route + stops
```

### Companies, Staff, Vehicles, Expenses
```
GET, POST, PUT endpoints available for each
```

### Master Data Sync
```
GET  /api/sync                 → Gets: clients, companies, staff, 
                                 vehicles, prices (1 call instead of 5)
```

## 💾 Data Flow Example

### Creating an Order:
```
User fills hotel demand form
    ↓
Clicks "Post Order"
    ↓
onPlaceOrder() → ordersAPI.create()
    ↓
POST /api/orders with JSON:
{
  "clientName": "Hotel Radhika",
  "clientType": "Hotel",
  "clientId": "c1",
  "items": [
    {"type": "Fresh", "weight": 50, "quantity": 100, "sellingRate": 250}
  ],
  "date": "2026-02-07"
}
    ↓
Backend inserts into commercial_orders + order_items tables
    ↓
Returns created order object
    ↓
Frontend updates state: setOrders([newOrder, ...orders])
    ↓
UI updates automatically with new order
    ↓
Data persists in database ✓
```

### Procurement Route:
```
Select vehicle + driver + date
    ↓
Add stops: company → weight → rate
    ↓
addHeavyRoute() → heavyRoutesAPI.create()
    ↓
POST /api/heavy-routes with route + stops
    ↓
Backend inserts into heavy_routes + route_stops
    ↓
Frontend updates dashboard metrics
    ↓
Data persists ✓
```

## 🔄 Real-time Sync

### On App Load:
```
useEffect(() => {
  syncAPI.getAll()  // 1 API call gets: clients, companies, staff, vehicles
  ordersAPI.getAll()
  heavyRoutesAPI.getAll()
  expensesAPI.getAll()
}, [])
```

### Every 30 seconds (optional):
```javascript
setInterval(syncAPI.getAll, 30000)
```

## 📈 Dashboard Metrics (Dynamic Calculations)

```
Total Sales = ∑ (Order Items × Selling Rate)
Total Cost = Procurement + Expenses + Staff Salaries  
Net Profit = Total Sales - Total Cost
Profit Margin = (Net Profit / Total Sales) × 100

Collection % = Collected / Total Sales × 100
Pending Amount = Total Sales - Collected

Staff Salary Proration:
  Daily:   baseSalary / 30.41
  Weekly:  baseSalary / 4.34
  Monthly: baseSalary (full)

Fuel Efficiency Check:
  IF (Fuel Expenses > Sales × 0.12) → Alert "Optimize routes"
```

## 🛡️ Error Handling

### In Frontend:
```javascript
try {
  const order = await ordersAPI.create(data)
  setOrders([order, ...orders])
} catch (err) {
  setError(handleAPIError(err))
  // Shows error toast/modal
}
```

### In Backend:
```javascript
try {
  const [rows] = await conn.query(sql)
  res.json(rows)
} catch (err) {
  res.status(500).json({ error: err.message })
}
```

## 🔐 Security Features

✓ Environment variables for credentials (.env)
✓ CORS enabled for frontend-backend communication
✓ UUID for unique ID generation (not sequential)
✓ Connection pooling (max 10 connections)
✓ Input validation before database insert
✓ Prepared statements prevent SQL injection

## 📊 Sample Query Examples

### Get orders with items:
```sql
SELECT o.*, 
  GROUP_CONCAT(JSON_OBJECT('type', oi.type, 'weight', oi.weight)) as items
FROM commercial_orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.timestamp DESC
```

### Get daily profit summary:
```sql
SELECT SUM(oi.weight * oi.selling_rate) as sales,
       SUM(rs.weight * rs.rate) as cost,
       SUM(e.amount) as expenses
FROM order_items oi
LEFT JOIN route_stops rs
LEFT JOIN expenses e
WHERE DATE(from_unixtime(o.timestamp/1000)) = CURDATE()
```

### Get defaulters list:
```sql
SELECT c.name, SUM(oi.weight * oi.selling_rate) - SUM(p.amount) as pending
FROM clients c
LEFT JOIN commercial_orders o ON c.id = o.client_id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN payments p ON o.id = p.order_id
GROUP BY c.id
HAVING pending > 0
ORDER BY pending DESC
```

## 🧪 Testing the System

### Test Order Creation:
1. Dashboard → Order Command Center
2. Select Hotel Radhika
3. Enter: Fresh 50kg, Broiler 30kg
4. Click "Post Order"
5. Check: Orders appear in Reports tab
6. Check DB: `SELECT * FROM commercial_orders`

### Test Procurement:
1. Sidebar → Procurement
2. Select vehicle (Eicher-704)
3. Select driver (Yousuf)
4. Add company stop (Skylark, Fresh, 500kg, £200/kg)
5. Click "Log Inbound Trip"
6. Check: Route appears in Reports

### Test Reconciliation:
1. Order Command Center → Post order
2. Shop Delivery → Create delivery matching order
3. Reconciliation table shows: ✓ Complete or ✗ Short Ship

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database Connection Error | Check MySQL is running, backend on 5000 |
| 404 on API calls | Backend not running: `node server.js` |
| CORS error | Backend CORS enabled (already configured) |
| Data not saving | Check backend console for errors |
| Blank dashboard | Check browser console (F12) for errors |
| Slow performance | Check: 1000+ records? Add pagination |

## 📈 Next Steps for Production

1. **Authentication** - Add login system (JWT tokens)
2. **Pagination** - For tables with 1000+ records
3. **Caching** - Redis for frequently accessed data
4. **Backups** - Automated daily database backups
5. **Monitoring** - Alert for critical events
6. **Analytics** - Advanced reporting & charts
7. **Mobile App** - React Native for field staff

---

**Everything is connected and ready to use!** 🎉

All data entered in the UI now persists in the database.
All calculations use live data from the database.
All reports are dynamically generated.

Enjoy your fully functional boiler management system! 🚀
