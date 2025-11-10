-- สร้างฐานข้อมูล (หากยังไม่มี)
CREATE DATABASE IF NOT EXISTS taskdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskdb;

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('user', 'premium', 'admin') DEFAULT 'user',
  isPremium BOOLEAN DEFAULT FALSE,
  subscriptionExpiry DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  ownerId INT,
  assignedTo INT,
  isPublic BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- สร้าง user เริ่มต้น (admin)
INSERT INTO users (email, password, name, role, isPremium)
VALUES ('admin@example.com', 'admin123', 'Admin User', 'admin', TRUE);

-- ตัวอย่าง task
INSERT INTO tasks (title, description, priority, ownerId, isPublic)
VALUES ('Initial setup', 'Setup Docker and Database', 'high', 1, TRUE);