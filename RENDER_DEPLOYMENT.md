# 🚀 Render.com Deployment Guide - Fashion Park

## 📋 **Prerequisites**
- [Render.com Account](https://render.com) (Sign up dengan GitHub)
- [GitHub Repository](https://github.com/nezferoz/fashion-park)
- API Keys untuk services (Midtrans, RajaOngkir, Email)

## 🎯 **Step-by-Step Deployment**

### **1. Setup Render.com Account**
1. Buka [render.com](https://render.com)
2. Klik "Get Started for Free"
3. Sign up dengan GitHub account
4. Authorize Render untuk akses repository

### **2. Deploy dengan Blueprint**
1. Klik **"New +"** → **"Blueprint"**
2. Connect ke GitHub repository `nezferoz/fashion-park`
3. Render akan auto-detect `render.yaml`
4. Klik **"Apply"** untuk deploy

### **3. Setup Environment Variables**
Setelah deploy, tambahkan di backend service:

```env
# Database (akan otomatis dari Render)
DATABASE_URL="mysql://username:password@host:port/database_name"

# Email Service (pilih salah satu)
SENDGRID_API_KEY="your_sendgrid_key"
# ATAU
BREVO_API_KEY="your_brevo_key"
# ATAU
RESEND_API_KEY="your_resend_key"

# Payment Gateway
MIDTRANS_SERVER_KEY="your_midtrans_key"
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_IS_PRODUCTION=true

# Shipping API
RAJAONGKIR_API_KEY="your_rajaongkir_key"
RAJAONGKIR_BASE_URL="https://api.rajaongkir.com/starter"
```

### **4. Setup Database Schema**
Setelah database ready:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### **5. Test Deployment**
1. **Backend Health Check**: `https://fashion-park-backend.onrender.com/health`
2. **Frontend**: `https://fashion-park-frontend.onrender.com`
3. **Database**: Check di Render dashboard

## 🔧 **Configuration Files**

### **render.yaml**
```yaml
services:
  # Backend API Service
  - type: web
    name: fashion-park-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install && npx prisma generate
    startCommand: cd backend && npm start
    healthCheckPath: /health
    autoDeploy: true

  # MySQL Database
  - type: mysql
    name: fashion-park-db
    plan: free
    version: 8.0

  # Frontend
  - type: web
    name: fashion-park-frontend
    env: static
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/build
    autoDeploy: true
```

## 🌐 **Domain & SSL**
- **Backend**: `https://fashion-park-backend.onrender.com`
- **Frontend**: `https://fashion-park-frontend.onrender.com`
- **Database**: Internal connection
- **SSL**: Otomatis dari Render

## 📊 **Monitoring & Logs**
- **Render Dashboard**: Real-time logs
- **Health Check**: `/health` endpoint
- **Auto-restart**: Jika crash
- **Build Logs**: Setiap deployment

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Build Failed**
   - Cek Node.js version compatibility
   - Pastikan semua dependencies terinstall
   - Cek build logs di Render dashboard

2. **Database Connection Error**
   - Cek DATABASE_URL format
   - Pastikan database sudah running
   - Cek environment variables

3. **Frontend API Error**
   - Cek REACT_APP_API_URL
   - Pastikan backend sudah running
   - Cek CORS configuration

### **Useful Commands:**
```bash
# Check build status
# Lihat di Render dashboard

# View logs
# Lihat di Render dashboard → Logs tab

# Restart service
# Lihat di Render dashboard → Manual Deploy
```

## 🔗 **Useful Links**
- [Render Documentation](https://render.com/docs)
- [Free Tier Limits](https://render.com/docs/free)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Database Setup](https://render.com/docs/databases)

## ✅ **Deployment Checklist**
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Blueprint deployed successfully
- [ ] Database service running
- [ ] Backend service running
- [ ] Frontend service running
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] API endpoints tested
- [ ] Frontend connected to backend

## 💰 **Free Tier Limits**
- **Web Services**: 750 jam/bulan
- **Databases**: 90 hari trial
- **Bandwidth**: 100GB/bulan
- **Build Time**: 500 menit/bulan

---

**🎉 Selamat! Fashion Park Anda sudah live di Render.com!**

**Backend**: https://fashion-park-backend.onrender.com
**Frontend**: https://fashion-park-frontend.onrender.com
**Database**: MySQL (internal)
