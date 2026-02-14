const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'razaboiler',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ===== CLIENTS ROUTES =====
app.get('/api/clients', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM clients ORDER BY created_at DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, type, location, route, contact, balance_due } = req.body;
    const id = uuidv4();
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO clients (id, name, type, location, route, contact, balance_due) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, location, route, contact, balance_due || 0]
    );
    conn.release();
    res.json({ id, name, type, location, route, contact, balance_due: balance_due || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, type, location, route, contact, balance_due } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE clients SET name=?, type=?, location=?, route=?, contact=?, balance_due=? WHERE id=?',
      [name, type, location, route, contact, balance_due, req.params.id]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM clients WHERE id=?', [req.params.id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== COMPANIES ROUTES =====
app.get('/api/companies', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM companies ORDER BY created_at DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, location, contact } = req.body;
    const id = uuidv4();
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO companies (id, name, location, contact) VALUES (?, ?, ?, ?)',
      [id, name, location, contact]
    );
    conn.release();
    res.json({ id, name, location, contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { name, location, contact } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE companies SET name=?, location=?, contact=? WHERE id=?',
      [name, location, contact, req.params.id]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STAFF ROUTES =====
app.get('/api/staff', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM staff ORDER BY created_at DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { name, role, team, salary } = req.body;
    const id = uuidv4();
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO staff (id, name, role, team, salary) VALUES (?, ?, ?, ?, ?)',
      [id, name, role, team, salary]
    );
    conn.release();
    res.json({ id, name, role, team, salary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== VEHICLES ROUTES =====
app.get('/api/vehicles', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { name, type, plate, capacity } = req.body;
    const id = uuidv4();
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO vehicles (id, name, type, plate, capacity) VALUES (?, ?, ?, ?, ?)',
      [id, name, type, plate, capacity]
    );
    conn.release();
    res.json({ id, name, type, plate, capacity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDERS ROUTES =====
app.get('/api/orders', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [orders] = await conn.query(
      `SELECT o.*, GROUP_CONCAT(
        JSON_OBJECT('id', oi.id, 'type', oi.type, 'weight', oi.weight, 'quantity', oi.quantity, 
                     'sellingRate', oi.selling_rate, 'actualWeight', oi.actual_weight)
      ) as items_json FROM commercial_orders o 
       LEFT JOIN order_items oi ON o.id = oi.order_id 
       GROUP BY o.id ORDER BY o.timestamp DESC`
    );
    conn.release();
    
    const formattedOrders = orders.map(o => ({
      ...o,
      items: o.items_json ? JSON.parse('[' + o.items_json + ']') : []
    }));
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { clientName, clientType, clientId, items, date } = req.body;
    const id = uuidv4();
    const timestamp = Date.now();
    const conn = await pool.getConnection();
    
    await conn.query(
      `INSERT INTO commercial_orders (id, client_name, client_id, client_type, order_date, timestamp, status, payment_status, total_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientName, clientId || null, clientType, date, timestamp, 'PendingCutting', 'Unpaid', 0]
    );
    
    // Insert items
    for (const item of items) {
      const itemId = uuidv4();
      await conn.query(
        `INSERT INTO order_items (id, order_id, type, weight, quantity, selling_rate) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, id, item.type, item.weight, item.quantity || 0, item.sellingRate || 0]
      );
    }
    
    conn.release();
    res.json({ id, clientName, clientType, clientId, items, date, status: 'PendingCutting', paymentStatus: 'Unpaid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status, paymentStatus, amountCollected } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE commercial_orders SET status=?, payment_status=?, amount_collected=? WHERE id=?',
      [status || null, paymentStatus || null, amountCollected || null, req.params.id]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== HEAVY ROUTES ROUTES =====
app.get('/api/heavy-routes', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [routes] = await conn.query(
      `SELECT r.id, r.vehicle_id, r.driver_id, r.date, r.timestamp, r.type,
              GROUP_CONCAT(
                JSON_OBJECT('id', rs.id, 'category', rs.category, 'weight', rs.weight, 'quantity', rs.quantity, 
                           'rate', rs.rate, 'companyId', rs.company_id, 'companyName', rs.company_name, 
                           'shopName', rs.shop_name, 'clientId', rs.client_id)
              ) as stops_json 
       FROM heavy_routes r 
       LEFT JOIN route_stops rs ON r.id = rs.route_id 
       GROUP BY r.id 
       ORDER BY r.timestamp DESC 
       LIMIT 100`
    );
    conn.release();
    
    const formattedRoutes = routes.map(r => ({
      id: r.id,
      vehicleId: r.vehicle_id,
      driverId: r.driver_id,
      date: r.date,
      timestamp: r.timestamp,
      type: r.type,
      stops: r.stops_json ? JSON.parse('[' + r.stops_json + ']').filter(s => s.id !== null) : []
    }));
    console.log('Fetched Heavy Routes:', formattedRoutes);
    res.json(formattedRoutes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/heavy-routes', async (req, res) => {
  try {
    const { vehicleId, driverId, date, type, stops } = req.body;
    const id = uuidv4();
    const timestamp = new Date(date).getTime();
    const conn = await pool.getConnection();
    
    // Allow NULL for vehicleId and driverId
    await conn.query(
      `INSERT INTO heavy_routes (id, vehicle_id, driver_id, date, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, vehicleId || null, driverId || null, date, timestamp, type]
    );
    
    // Insert stops
    const insertedStops = [];
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const stopId = uuidv4();
      await conn.query(
        `INSERT INTO route_stops (id, route_id, stop_order, category, company_id, client_id, weight, quantity, rate, shop_name, company_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stopId, id, i, stop.category, stop.companyId || null, stop.shopId || null, stop.weight, stop.quantity || 0, stop.rate, stop.shopName || null, stop.companyName || null]
      );
      insertedStops.push({
        id: stopId,
        stopOrder: i,
        category: stop.category,
        companyId: stop.companyId || null,
        clientId: stop.shopId || null,
        weight: stop.weight,
        quantity: stop.quantity || 0,
        rate: stop.rate,
        shopName: stop.shopName,
        companyName: stop.companyName
      });
    }
    
    conn.release();
    res.json({ id, vehicleId: vehicleId || null, driverId: driverId || null, date, type, stops: insertedStops, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EXPENSES ROUTES =====
app.get('/api/expenses', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM expenses ORDER BY timestamp DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { type, amount, description, staffId, vehicleId, expenseDate } = req.body;
    const id = uuidv4();
    const timestamp = new Date(expenseDate).getTime();
    const conn = await pool.getConnection();
    
    await conn.query(
      `INSERT INTO expenses (id, type, amount, description, staff_id, vehicle_id, expense_date, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, amount, description, staffId || null, vehicleId || null, expenseDate, timestamp]
    );
    
    conn.release();
    res.json({ id, type, amount, description, staffId, vehicleId, expenseDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SYNC ALL DATA ENDPOINT =====
app.get('/api/sync', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [clients] = await conn.query('SELECT * FROM clients');
    const [companies] = await conn.query('SELECT * FROM companies');
    const [staff] = await conn.query('SELECT * FROM staff');
    const [vehicles] = await conn.query('SELECT * FROM vehicles');
    const [prices] = await conn.query('SELECT * FROM daily_prices WHERE price_date = CURDATE()');
    
    conn.release();
    
    res.json({
      clients,
      companies,
      staff,
      vehicles,
      prices: prices.length > 0 ? prices[0] : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Backend running on http://localhost:${PORT}`);
  console.log(`✓ Database: razaboiler`);
  console.log(`✓ All APIs ready`);
});
