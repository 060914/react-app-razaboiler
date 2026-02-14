-- Raza Boiler Management System Database Schema

CREATE DATABASE IF NOT EXISTS razaboiler;
USE razaboiler;

-- ===== CORE ENTITIES =====

-- Clients (Hotels, Shops)
CREATE TABLE clients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('Hotel', 'Shop') NOT NULL,
  location VARCHAR(255),
  route VARCHAR(255),
  contact VARCHAR(20),
  balance_due DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies (Suppliers/Farms)
CREATE TABLE companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE staff (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role ENUM('Manager', 'Driver', 'DeliveryBoy', 'Cutter', 'Helper') NOT NULL,
  team VARCHAR(100),
  salary DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE vehicles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('Pickup', 'Delivery', 'Container') NOT NULL,
  plate VARCHAR(50) UNIQUE NOT NULL,
  capacity DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===== TRANSACTIONAL DATA =====

-- Heavy Routes (Procurement & Shop Deliveries)
CREATE TABLE heavy_routes (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('Pickup', 'ShopDelivery', 'HotelDelivery') NOT NULL,
  vehicle_id VARCHAR(36) NOT NULL,
  driver_id VARCHAR(36),
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES staff(id),
  INDEX idx_type_date (type, date),
  INDEX idx_timestamp (timestamp)
);

-- Route Stops
CREATE TABLE route_stops (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL,
  stop_order INT,
  stop_type ENUM('pickup', 'delivery') DEFAULT 'pickup',
  category VARCHAR(100),
  company_id VARCHAR(36),
  client_id VARCHAR(36),
  weight DECIMAL(12, 2) NOT NULL,
  quantity INT,
  rate DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES heavy_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX idx_route_id (route_id)
);

-- Commercial Orders
CREATE TABLE commercial_orders (
  id VARCHAR(36) PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_id VARCHAR(36),
  client_type ENUM('Hotel', 'Shop') NOT NULL,
  order_date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  status ENUM('PendingCutting', 'PendingLoad', 'Delivered', 'Cancelled') DEFAULT 'PendingCutting',
  payment_status ENUM('Unpaid', 'PartiallyPaid', 'Paid') DEFAULT 'Unpaid',
  total_amount DECIMAL(12, 2) DEFAULT 0,
  amount_collected DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX idx_client_date (client_id, order_date),
  INDEX idx_status (status),
  INDEX idx_timestamp (timestamp)
);

-- Order Items
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  type VARCHAR(100) NOT NULL,
  weight DECIMAL(12, 2) NOT NULL,
  quantity INT DEFAULT 0,
  selling_rate DECIMAL(12, 2) DEFAULT 0,
  actual_weight DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES commercial_orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id)
);

-- Expenses
CREATE TABLE expenses (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('Fuel', 'Maintenance', 'Allowance', 'Other') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description VARCHAR(500),
  staff_id VARCHAR(36),
  vehicle_id VARCHAR(36),
  expense_date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  INDEX idx_type_date (type, expense_date),
  INDEX idx_timestamp (timestamp)
);

-- Daily Prices
CREATE TABLE daily_prices (
  id VARCHAR(36) PRIMARY KEY,
  price_date DATE NOT NULL UNIQUE,
  fresh_rate DECIMAL(12, 2),
  broiler_rate DECIMAL(12, 2),
  collection_rate DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_price_date (price_date)
);

-- Payments
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36),
  client_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('Cash', 'Cheque', 'Bank', 'UPI') DEFAULT 'Cash',
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES commercial_orders(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX idx_client_date (client_id, payment_date),
  INDEX idx_timestamp (timestamp)
);

-- ===== SUMMARY TABLES (for performance) =====

-- Daily Summary
CREATE TABLE daily_summary (
  id VARCHAR(36) PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  net_profit DECIMAL(12, 2) DEFAULT 0,
  total_collected DECIMAL(12, 2) DEFAULT 0,
  pending_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_summary_date (summary_date)
);

-- ===== CREATE SAMPLE DATA =====

INSERT INTO clients (id, name, type, location, route, contact, balance_due) VALUES
('c1', 'Hotel Radhika', 'Hotel', 'City', 'City Center', '9123456780', 4500),
('c2', 'Paradise Inn', 'Hotel', 'Uptown', 'Nashik Road', '9123456781', 1200),
('c3', 'Zeeshan Shop', 'Shop', 'Market', 'City Center', '9123456782', 0),
('c4', 'Noor Chicken', 'Shop', 'Cross', 'Hadapsar', '9123456783', 0);

INSERT INTO companies (id, name, location, contact) VALUES
('comp1', 'Skylark', 'Wadki Unit', '9876543210'),
('comp2', 'Premium', 'Farm A', '9876543211');

INSERT INTO staff (id, name, role, team, salary) VALUES
('s1', 'Tabrez', 'Manager', NULL, 25000),
('s2', 'Nawaz', 'Manager', NULL, 22000),
('s3', 'Saddam', 'Manager', NULL, 20000),
('s4', 'Sadiq', 'DeliveryBoy', 'ShopDelivery', 15000),
('s5', 'Imran', 'DeliveryBoy', 'ShopDelivery', 15000),
('s6', 'Navya', 'DeliveryBoy', 'HotelDelivery', 15000),
('s7', 'Mushtaq', 'Cutter', 'Cutting', 14000),
('s8', 'Yousuf', 'Driver', NULL, 18000);

INSERT INTO vehicles (id, name, type, plate, capacity) VALUES
('v1', 'Eicher-704', 'Pickup', 'KA-01-9988', 5000),
('v2', 'TataAce-01', 'Pickup', 'KA-01-2233', 3000);

INSERT INTO daily_prices (id, price_date, fresh_rate, broiler_rate, collection_rate) VALUES
('dp1', CURDATE(), 250, 180, 200);
