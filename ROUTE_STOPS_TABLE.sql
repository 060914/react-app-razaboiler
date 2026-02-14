-- Create heavy_routes table
CREATE TABLE IF NOT EXISTS heavy_routes (
  id VARCHAR(36) PRIMARY KEY,
  vehicle_id VARCHAR(36) NULL,
  driver_id VARCHAR(36) NULL,
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  type ENUM('Pickup', 'ShopDelivery', 'HotelDelivery') DEFAULT 'Pickup',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES staff(id) ON DELETE SET NULL,
  INDEX idx_type_date (type, date),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create route_stops table (for detailed stop information)
CREATE TABLE IF NOT EXISTS route_stops (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL,
  stop_order INT DEFAULT 0,
  category VARCHAR(50),
  company_id VARCHAR(36) NULL,
  client_id VARCHAR(36) NULL,
  weight DECIMAL(10, 2) DEFAULT 0,
  quantity INT DEFAULT 0,
  rate DECIMAL(10, 2) DEFAULT 0,
  shop_name VARCHAR(100),
  company_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES heavy_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  INDEX idx_route_id (route_id),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
