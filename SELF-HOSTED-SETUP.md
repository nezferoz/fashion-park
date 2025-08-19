# 🏠 Self-Hosted Fashion Park Inventory System

## 📋 Overview

Panduan lengkap untuk menjalankan sistem Fashion Park Inventory di komputer sendiri **100% GRATIS** tanpa limit hosting.

## 🎯 Keuntungan Self-Hosted

- ✅ **100% GRATIS** - Tidak ada biaya bulanan
- ✅ **Tidak ada limit** - Bisa running 24/7
- ✅ **Full control** - Bisa customize sesuai kebutuhan
- ✅ **Data aman** - Tidak di cloud pihak ketiga
- ✅ **Performance bagus** - Tidak ada network latency

## 🗂️ File yang Tersedia

### 1. **`mysql-compatible-schema.sql`** - Database Schema
- Struktur tabel lengkap untuk MySQL
- Sample data untuk testing
- Triggers dan functions

### 2. **`mysql-config.sql`** - Konfigurasi Database
- Setup karakter set dan collation
- Konfigurasi SQL mode

### 3. **`server.js`** - Backend Server
- Express.js server dengan semua API endpoints
- Authentication dengan JWT
- Database connection pooling

### 4. **`package.json`** - Dependencies
- Semua package yang diperlukan
- Scripts untuk development dan production

### 5. **`env-template.txt`** - Environment Variables
- Template untuk konfigurasi

## 🚀 Langkah Setup

### **Langkah 1: Install Software yang Diperlukan**

#### **Install Node.js**
```bash
# Download dari https://nodejs.org/
# Pilih versi LTS (Long Term Support)
# Install dengan default settings
```

#### **Install MySQL**
```bash
# Option 1: XAMPP (Recommended untuk Windows)
# Download dari https://www.apachefriends.org/
# Install dengan default settings

# Option 2: MySQL Standalone
# Download dari https://dev.mysql.com/downloads/
# Install dengan default settings
```

### **Langkah 2: Setup Database**

#### **Start MySQL Service**
```bash
# Jika menggunakan XAMPP:
# 1. Buka XAMPP Control Panel
# 2. Start Apache dan MySQL
# 3. Klik "Admin" pada MySQL row

# Jika menggunakan MySQL standalone:
# MySQL service sudah running otomatis
```

#### **Setup Database**
```bash
# Buka MySQL Command Line atau phpMyAdmin
# Jalankan file setup:

# 1. Setup konfigurasi
source mysql-config.sql

# 2. Import schema
source mysql-compatible-schema.sql

# 3. Verifikasi
SHOW TABLES;
SELECT * FROM categories;
```

### **Langkah 3: Setup Backend**

#### **Install Dependencies**
```bash
# Di folder project
npm install
```

#### **Setup Environment Variables**
```bash
# 1. Copy env-template.txt ke .env
cp env-template.txt .env

# 2. Edit file .env dengan kredensial MySQL Anda
# Contoh:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fashion_park
JWT_SECRET=your-super-secret-key
```

#### **Start Server**
```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

### **Langkah 4: Test API**

#### **Health Check**
```bash
# Buka browser atau Postman
GET http://localhost:3000/

# Response yang diharapkan:
{
  "message": "Fashion Park Inventory System API",
  "status": "Running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### **Test Categories API**
```bash
GET http://localhost:3000/api/categories

# Response: Array of categories
```

#### **Test Products API**
```bash
GET http://localhost:3000/api/products

# Response: Array of products with category names
```

## 🌐 Akses dari Internet (Opsional)

### **Setup Ngrok Tunnel**

#### **Install Ngrok**
```bash
# Install globally
npm install -g ngrok

# Atau download dari https://ngrok.com/
```

#### **Buat Tunnel**
```bash
# Jalankan backend dulu
npm start

# Di terminal baru, buat tunnel
ngrok http 3000

# Dapat URL seperti: https://abc123.ngrok.io
```

#### **Update Environment**
```bash
# Edit file .env
EXTERNAL_URL=https://abc123.ngrok.io
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Products**
- `GET /api/categories` - Get all categories
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)

### **Transactions**
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/user` - Get user transactions

### **Cart**
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart

## 🧪 Testing dengan Postman

### **1. Test Registration**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "08123456789",
  "role": "pelanggan"
}
```

### **2. Test Login**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### **3. Test Products (dengan token)**
```bash
GET http://localhost:3000/api/products
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚨 Troubleshooting

### **Database Connection Error**
```bash
# Cek MySQL service running
# Cek kredensial di .env
# Cek database 'fashion_park' sudah dibuat
```

### **Port Already in Use**
```bash
# Cek port 3000 sudah digunakan
netstat -ano | findstr :3000

# Kill process atau ganti port di .env
PORT=3001
```

### **Module Not Found**
```bash
# Install dependencies
npm install

# Cek package.json sudah benar
```

### **Permission Denied**
```bash
# Windows: Run as Administrator
# Linux/Mac: sudo npm start
```

## 📱 Frontend Integration

### **Environment Variables untuk Frontend**
```javascript
// .env.local atau .env
NEXT_PUBLIC_API_URL=http://localhost:3000
# atau jika menggunakan Ngrok:
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

### **API Calls dari Frontend**
```javascript
// Contoh fetch products
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
const products = await response.json();
```

## 🔒 Security Considerations

### **Production Setup**
```bash
# 1. Ganti JWT_SECRET dengan random string yang kuat
# 2. Setup firewall untuk MySQL (port 3306)
# 3. Gunakan HTTPS dengan SSL certificate
# 4. Setup rate limiting
# 5. Regular database backups
```

### **Environment Variables**
```bash
# Jangan commit .env ke Git
# Gunakan .env.example untuk template
# Setup environment variables di production server
```

## 📊 Monitoring & Maintenance

### **Logs**
```bash
# Server logs di console
# Database logs di MySQL
# Setup log rotation untuk production
```

### **Backup**
```bash
# Backup database regular
mysqldump -u root -p fashion_park > backup.sql

# Backup code dengan Git
git add .
git commit -m "Backup before changes"
```

### **Updates**
```bash
# Update dependencies
npm update

# Update Node.js ke versi LTS terbaru
# Update MySQL ke versi terbaru
```

## 🎉 Selamat!

Sistem Fashion Park Inventory sudah berjalan **100% GRATIS** di komputer Anda!

### **Langkah Selanjutnya:**
1. **Test semua API endpoints**
2. **Integrasikan dengan frontend**
3. **Setup Ngrok untuk akses internet**
4. **Deploy ke production server (opsional)**

### **Support:**
- Cek logs di console
- Test API dengan Postman
- Verifikasi database dengan phpMyAdmin
- Cek environment variables

---

**💡 Tips:** Sistem ini bisa running 24/7 di komputer Anda tanpa biaya apapun!
