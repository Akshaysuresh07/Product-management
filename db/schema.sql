CREATE DATABASE IF NOT EXISTS product_management;
USE product_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash)
VALUES
  ('Admin', 'admin@example.com', '$2a$10$5wKobpXDI3GKPXJO0t2L0uRLv41onESLnliX1ANiwh4rI9BZeQaeG')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO products (name, description, price, quantity) VALUES
  ('Notebook', 'Hardcover notebook', 45, 40),
  ('Desk Lamp', 'LED adjustable lamp', 320, 15),
  ('Wireless Mouse', 'Ergonomic wireless mouse', 950, 5)
ON DUPLICATE KEY UPDATE name = VALUES(name);
