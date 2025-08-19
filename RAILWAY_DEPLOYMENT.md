# 🚀 Railway Deployment Guide - Fashion Park

## 📋 **Prerequisites**
- [Railway Account](https://railway.app/)
- [GitHub Repository](https://github.com/nezferoz/fashion-park)
- Database (MySQL/PostgreSQL)
- API Keys untuk services

## 🎯 **Step-by-Step Deployment**

### **1. Setup Railway Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login ke Railway
railway login

# Buat project baru
railway init

# Connect ke GitHub repository
railway link
```

### **2. Setup Database di Railway**
- Buka Railway Dashboard
- Klik "New Service" → "Database" → "MySQL"
- Tunggu provisioning selesai
- Copy connection string

### **3. Setup Environment Variables**
Di Railway Dashboard, tambahkan environment variables:

```env
# Database
DATABASE_URL="mysql://username:password@host:port/database_name"

# JWT
JWT_SECRET="your_secure_jwt_secret_here"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="production"

# Email (Pilih salah satu)
SENDGRID_API_KEY="your_sendgrid_key"
# ATAU
BREVO_API_KEY="your_brevo_key"
# ATAU
RESEND_API_KEY="your_resend_key"

# Payment
MIDTRANS_SERVER_KEY="your_midtrans_key"
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_IS_PRODUCTION=true

# Shipping
RAJAONGKIR_API_KEY="your_rajaongkir_key"
RAJAONGKIR_BASE_URL="https://api.rajaongkir.com/starter"

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN="*"
```

### **4. Deploy Backend**
```bash
# Deploy ke Railway
railway up

# Atau deploy otomatis dari GitHub
# Railway akan auto-deploy setiap push ke main branch
```

### **5. Setup Database Schema**
```bash
# Generate Prisma client
railway run npx prisma generate

# Run database migrations
railway run npx prisma migrate deploy

# Seed database (optional)
railway run npx prisma db seed
```

### **6. Setup Frontend (Optional)**
Jika ingin deploy frontend juga:

```bash
# Build frontend
cd frontend
npm run build

# Deploy ke Railway atau hosting lain
# Update API_URL di frontend ke Railway backend URL
```

## 🔧 **Configuration Files**

### **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Backend Package.json Scripts**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npm install",
    "postinstall": "npx prisma generate"
  }
}
```

## 🌐 **Domain & SSL**
- Railway otomatis memberikan domain
- SSL certificate otomatis
- Custom domain bisa ditambahkan

## 📊 **Monitoring**
- Railway Dashboard untuk logs
- Health check endpoint: `/health`
- Auto-restart jika crash
- Resource monitoring

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Database Connection Error**
   - Cek DATABASE_URL format
   - Pastikan database sudah running

2. **Build Failed**
   - Cek Node.js version compatibility
   - Pastikan semua dependencies terinstall

3. **Environment Variables Missing**
   - Cek semua required env vars sudah diset
   - Restart service setelah update env vars

### **Useful Commands:**
```bash
# View logs
railway logs

# Check service status
railway status

# Restart service
railway service restart

# SSH ke service
railway shell
```

## 🔗 **Useful Links**
- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/reference/cli)
- [Environment Variables](https://docs.railway.app/deploy/environments)
- [Database Setup](https://docs.railway.app/databases)

## ✅ **Deployment Checklist**
- [ ] Railway project created
- [ ] Database service provisioned
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] API endpoints tested
- [ ] Frontend configured (if applicable)
- [ ] Custom domain configured (optional)

---

**🎉 Selamat! Fashion Park Anda sudah live di Railway!**
