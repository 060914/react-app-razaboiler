# Raza Boiler Management System - Database Integration Setup Guide

## Complete Procedure

### PART 1: DATABASE SETUP

#### Step 1.1: Import Database Schema
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Click on **"Import"** from the top menu
3. Click **"Choose File"** and select `database.sql` from your project root
4. Click **"Import"** button
5. Verify database created: You should see **"razaboiler"** database in left panel

**OR using Command Line:**
```bash
mysql -u root -p < database.sql
```
(Leave password empty, just press Enter)

#### Verify Database:
```sql
USE razaboiler;
SHOW TABLES;
```

Should display 12 tables:
- clients
- companies
- staff  
- vehicles
- heavy_routes
- route_stops
- commercial_orders
- order_items
- expenses
- daily_prices
- payments
- daily_summary

---

### PART 2: BACKEND SETUP

#### Step 2.1: Install Backend Dependencies
```bash
cd backend
npm install
```

This installs:
- express (server)
- mysql2 (database)
- cors (cross-origin)
- uuid (unique IDs)
- dotenv (environment variables)

#### Step 2.2: Create .env File
Create `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=razaboiler
PORT=5000
```

#### Step 2.3: Start Backend Server
```bash
node server.js
```

Expected output:
```
✓ Backend running on http://localhost:3000
✓ Database: razaboiler
✓ All APIs ready
```

**Keep this terminal open!**

---

### PART 3: FRONTEND SETUP

#### Step 3.1: Install Frontend Dependencies
```bash
npm install
```

This installs React, TypeScript, Tailwind CSS, and Lucide icons.

#### Step 3.2: Install uuid Package (if needed)
```bash
npm install uuid
```

#### Step 3.3: Start Frontend Development Server
Open a **NEW terminal** and run:
```bash
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:5173/
```

**Keep both terminals open (Backend & Frontend)**

---

### PART 4: VERIFY DATABASE CONNECTION

#### In the browser (http://localhost:5173):
1. App should load with **"Connecting to Database..."** message
2. After ~2 seconds, dashboard should appear
3. You should see sample data (4 clients, 2 companies, 8 staff, 2 vehicles)

**If you see an error:**
- ✓ Check backend is running on port 5000
- ✓ Check MySQL is running
- ✓ Check database was imported correctly
- ✓ Click "Retry" button in error screen

---

### PART 5: API ENDPOINTS REFERENCE

All endpoints are relative to `http://localhost:3000/api`

#### CLIENTS
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

#### COMPANIES
- `GET /companies` - List all companies
- `POST /companies` - Create new company
- `PUT /companies/:id` - Update company

#### STAFF
- `GET /staff` - List all staff
- `POST /staff` - Create new staff member

#### VEHICLES
- `GET /vehicles` - List all vehicles
- `POST /vehicles` - Create new vehicle

#### ORDERS
- `GET /orders` - List all orders with items
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status/payment

#### HEAVY ROUTES
- `GET /heavy-routes` - List all routes with stops
- `POST /heavy-routes` - Create new route

#### EXPENSES
- `GET /expenses` - List all expenses
- `POST /expenses` - Create new expense

#### SYNC (Get all master data at once)
- `GET /sync` - Returns: clients, companies, staff, vehicles, prices

---

### PART 6: DATABASE SCHEMA OVERVIEW

#### Master Data Tables (Reference data)
```
clients (Hotels, Shops)
companies (Suppliers/Farms)
staff (Employees)
vehicles (Trucks/Containers)
```

#### Transactional Tables (Business operations)
```
commercial_orders (Customer orders with items)
order_items (Individual items in orders)
heavy_routes (Procurement & Delivery routes)
route_stops (Pickup/Delivery stops on routes)
expenses (Operational costs)
payments (Payment records)
```

#### Configuration Tables
```
daily_prices (Market rates)
daily_summary (Aggregated daily metrics)
```

---

### PART 7: DATA SYNCHRONIZATION

#### Initial Load Flow:
1. Frontend loads → componentDidMount
2. Calls `/api/sync` endpoint to get:
   - All clients
   - All companies
   - All staff
   - All vehicles
   - Today's prices
3. Separately fetches:
   - All orders
   - All heavy routes
   - All expenses

#### Real-time Updates:
When you create data (orders, routes, etc.):
1. Frontend calls appropriate API endpoint
2. Backend inserts into database
3. Frontend updates local state
4. UI updates automatically

---

### PART 8: COMMON OPERATIONS

#### Creating an Order
```javascript
const order = {
  clientName: "Hotel Radhika",
  clientType: "Hotel",
  clientId: "c1",
  items: [
    { type: "Fresh", weight: 50, quantity: 100, sellingRate: 250 },
    { type: "Broiler", weight: 30, quantity: 60, sellingRate: 180 }
  ],
  date: "2026-02-07"
};

await ordersAPI.create(order);
```

#### Creating a Procurement Route
```javascript
const route = {
  vehicleId: "v1",
  driverId: "s8",
  date: "2026-02-07",
  type: "Pickup",
  stops: [
    {
      companyId: "comp1",
      category: "Fresh",
      weight: 500,
      quantity: 1000,
      rate: 200
    }
  ]
};

await heavyRoutesAPI.create(route);
```

#### Adding an Expense
```javascript
const expense = {
  type: "Fuel",
  amount: 1500,
  description: "Diesel for route Pune-Mumbai",
  vehicleId: "v1",
  expenseDate: "2026-02-07"
};

await expensesAPI.create(expense);
```

---

### PART 9: TROUBLESHOOTING

#### Issue: "Database Connection Error"

**Solution 1: Check MySQL is running**
```bash
# Windows (Command Prompt)
netstat -ano | findstr :3306

# Mac
lsof -i :3306
```

**Solution 2: Check Backend is running**
- Ensure `node server.js` is running in a terminal
- Should show "Backend running on http://localhost:3000"

**Solution 3: Check Database exists**
```bash
mysql -u root
SHOW DATABASES;
USE razaboiler;
SHOW TABLES;
```

#### Issue: "Cannot POST /api/orders"

**Cause**: Backend not running
**Solution**: 
```bash
cd backend
node server.js
```

#### Issue: Data not saving to database

**Check**: 
1. No errors in browser console (F12)
2. No errors in backend terminal
3. Backend received the request (should print)
4. Reload page to verify data persists

#### Issue: "npm command not found"

**Solution**: Install Node.js
- Download from https://nodejs.org (LTS version)
- Run installer
- Restart terminal/command prompt

---

### PART 10: PRODUCTION DEPLOYMENT TIPS

#### Before going live:

1. **Change database password**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_strong_password';
   FLUSH PRIVILEGES;
   ```

2. **Update backend .env**
   ```env
   DB_PASSWORD=your_strong_password
   ```

3. **Add environment check**
   ```javascript
   // In server.js
   if (process.env.NODE_ENV !== 'development') {
     // Use production settings
   }
   ```

4. **Enable CORS restrictions**
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

5. **Add request validation**
   - Validate all inputs before saving
   - Sanitize data
   - Add authentication

---

### PART 11: BACKUP & RESTORE

#### Backup Database:
```bash
mysqldump -u root razaboiler > backup_razaboiler_$(date +%Y%m%d).sql
```

#### Restore Database:
```bash
mysql -u root razaboiler < backup_razaboiler_20260207.sql
```

---

### PART 12: MONITORING & LOGGING

#### Check Active Connections:
```sql
SHOW PROCESSLIST;
```

#### View Database Logs:
- **Windows**: `C:\xampp\mysql\data\mysql.log`
- **Mac/Linux**: `/usr/local/mysql/data/error.log`

#### Monitor API Performance:
```javascript
// In server.js, add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});
```

---

### QUICK START CHECKLIST

- [ ] Imported database.sql into MySQL
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Backend running (`node server.js`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running (`npm run dev`)
- [ ] Can see dashboard at http://localhost:5173
- [ ] Sample data displaying
- [ ] Can create orders/routes without errors

---

**You're all set! The system is now fully connected to the database.**

For questions, check the Console (F12) for error messages or the backend terminal for logs.
