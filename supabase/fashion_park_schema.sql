-- Fashion Park Database Schema for Supabase
-- Import this file to Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'customer' CHECK (role IN ('owner', 'admin', 'cashier', 'customer')),
  full_name VARCHAR,
  phone VARCHAR,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR,
  sku VARCHAR UNIQUE,
  weight DECIMAL(8,2),
  dimensions VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Images table (for multiple images per product)
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart table
CREATE TABLE cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_method VARCHAR,
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_address TEXT,
  shipping_city VARCHAR,
  shipping_postal_code VARCHAR,
  shipping_phone VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Details table
CREATE TABLE order_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock Movements table
CREATE TABLE stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason VARCHAR,
  reference_id UUID,
  reference_type VARCHAR,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Logs table
CREATE TABLE payment_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_method VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR NOT NULL,
  transaction_id VARCHAR,
  gateway_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table (for external integrations)
CREATE TABLE api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  key_hash VARCHAR NOT NULL,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Pakaian Pria', 'Koleksi pakaian untuk pria dewasa'),
('Pakaian Wanita', 'Koleksi pakaian untuk wanita dewasa'),
('Pakaian Anak', 'Koleksi pakaian untuk anak-anak'),
('Aksesoris', 'Aksesoris fashion dan gaya'),
('Sepatu', 'Koleksi sepatu dan sandal'),
('Tas', 'Koleksi tas dan dompet');

-- Insert sample products
INSERT INTO products (name, description, price, stock, category_id, sku) VALUES 
('Kaos Pria Premium', 'Kaos pria dengan bahan premium cotton 100%, nyaman dipakai', 150000, 50, (SELECT id FROM categories WHERE name = 'Pakaian Pria'), 'KP-001'),
('Kemeja Pria Formal', 'Kemeja pria formal untuk acara resmi', 250000, 30, (SELECT id FROM categories WHERE name = 'Pakaian Pria'), 'KP-002'),
('Dress Wanita Elegant', 'Dress wanita dengan desain elegant dan modern', 350000, 25, (SELECT id FROM categories WHERE name = 'Pakaian Wanita'), 'KW-001'),
('Blouse Wanita Casual', 'Blouse wanita casual untuk sehari-hari', 180000, 40, (SELECT id FROM categories WHERE name = 'Pakaian Wanita'), 'KW-002'),
('Kaos Anak Lucu', 'Kaos anak dengan motif lucu dan nyaman', 80000, 60, (SELECT id FROM categories WHERE name = 'Pakaian Anak'), 'KA-001'),
('Tas Fashion Premium', 'Tas fashion dengan kualitas premium', 450000, 20, (SELECT id FROM categories WHERE name = 'Tas'), 'TAS-001'),
('Sepatu Sneakers Pria', 'Sneakers pria dengan desain modern', 320000, 35, (SELECT id FROM categories WHERE name = 'Sepatu'), 'SP-001'),
('Gelang Fashion', 'Gelang fashion dengan desain unik', 75000, 100, (SELECT id FROM categories WHERE name = 'Aksesoris'), 'AKS-001');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to products and categories
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);

-- Create policy for users to manage their own cart
CREATE POLICY "Users can manage their own cart" ON cart FOR ALL USING (auth.uid() = user_id);

-- Create policy for users to view their own orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to manage their own profile
CREATE POLICY "Users can manage their own profile" ON users FOR ALL USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
