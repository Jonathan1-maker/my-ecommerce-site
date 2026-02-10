-- PostgreSQL Schema for E-Commerce Platform (Neon DB)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items cascade;
DROP TABLE IF EXISTS orders cascade;
DROP TABLE IF EXISTS cart cascade;
DROP TABLE IF EXISTS wishlist cascade;
DROP TABLE IF EXISTS products cascade;
DROP TABLE IF EXISTS categories cascade;
DROP TABLE IF EXISTS addresses cascade;
DROP TABLE IF EXISTS users cascade;
DROP TABLE IF EXISTS coupons cascade;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('cod', 'stripe', 'paypal');
CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_name ON categories(name);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);

-- Addresses Table
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    payment_method payment_method_type NOT NULL,
    payment_status payment_status_type DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Cart Table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart(user_id);

-- Wishlist Table
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- Coupons Table
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type_enum NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- Function and Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@eshop.com', '$2b$10$rKvVPZhJvZ5qX8YqYqYqYOZqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'admin'),
('Jonathan Smith', 'jonathan@example.com', '$2b$10$rKvVPZhJvZ5qX8YqYqYqYOZqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'user');

INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Wearables', 'Smart watches and fitness trackers'),
('Audio', 'Headphones and speakers'),
('Gaming', 'Gaming consoles and accessories');

INSERT INTO products (name, description, price, category_id, stock, rating, reviews_count) VALUES 
('Wireless Headphones', 'Premium wireless headphones with noise cancellation', 99.00, 3, 50, 4.5, 23),
('Smart Watch', 'Advanced smartwatch with fitness tracking features', 150.00, 2, 30, 4.8, 23),
('Smart Watch Pro', 'Advanced smartwatch with fitness tracking features', 150.00, 2, 25, 4.5, 23),
('Ironman Gamer Mouse', 'High-precision gaming mouse with RGB lighting', 150.00, 4, 40, 4.7, 18);

INSERT INTO addresses (user_id, full_name, address_line1, city, zip_code, country, is_default) VALUES
(2, 'Jonathan Smith', '123 Main St', 'Springfield', '62701', 'USA', TRUE);

INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 1, 1),
(2, 2, 1);

INSERT INTO coupons (code, discount_type, discount_value, min_purchase, valid_until) VALUES
('WELCOME10', 'percentage', 10, 50, '2026-12-31 23:59:59'),
('SAVE20', 'fixed', 20, 100, '2026-12-31 23:59:59');
