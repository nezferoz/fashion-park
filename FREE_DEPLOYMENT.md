# 🆓 Free Deployment Guide - Fashion Park (Tanpa Kartu Kredit!)

## 🎯 **Solusi 100% Gratis:**
- **Frontend**: Vercel.com (React)
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Total Cost**: $0 (Gratis selamanya!)

## 📋 **Step 1: Deploy Frontend ke Vercel**

### **1.1 Setup Vercel Account**
1. Buka [vercel.com](https://vercel.com)
2. Klik "Sign Up"
3. Pilih "Continue with GitHub"
4. Authorize Vercel

### **1.2 Deploy Project**
1. Klik "New Project"
2. Import repository `nezferoz/fashion-park`
3. Vercel akan auto-detect React project
4. Klik "Deploy"

### **1.3 Konfigurasi**
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

## 📋 **Step 2: Setup Supabase Database**

### **2.1 Buat Supabase Account**
1. Buka [supabase.com](https://supabase.com)
2. Klik "Start your project"
3. Sign up dengan GitHub
4. Buat project baru

### **2.2 Setup Database Schema**
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2.3 Copy Connection Info**
- **Project URL**: `https://your-project.supabase.co`
- **Anon Key**: `your-anon-key`
- **Service Role Key**: `your-service-role-key`

## 📋 **Step 3: Deploy Backend ke Supabase Edge Functions**

### **3.1 Install Supabase CLI**
```bash
npm install -g supabase
```

### **3.2 Login dan Link Project**
```bash
supabase login
supabase link --project-ref your-project-ref
```

### **3.3 Deploy Edge Function**
```bash
supabase functions deploy fashion-park-api
```

### **3.4 Set Environment Variables**
```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

## 📋 **Step 4: Update Frontend Configuration**

### **4.1 Update API URL**
```javascript
// frontend/src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-project.supabase.co/functions/v1/fashion-park-api';
```

### **4.2 Set Environment Variable di Vercel**
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://your-project.supabase.co/functions/v1/fashion-park-api`

## 🌐 **Final URLs:**
- **Frontend**: `https://fashion-park.vercel.app`
- **Backend API**: `https://your-project.supabase.co/functions/v1/fashion-park-api`
- **Database**: Supabase Dashboard

## 💰 **Free Tier Limits:**
- **Vercel**: Unlimited projects, 100GB bandwidth/month
- **Supabase**: 500MB database, 50MB file storage, 2GB bandwidth/month
- **Edge Functions**: 500,000 invocations/month

## ✅ **Deployment Checklist:**
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Supabase account created
- [ ] Database schema created
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] Frontend connected to Supabase
- [ ] API endpoints tested

## 🚨 **Troubleshooting:**
1. **Build Failed di Vercel**
   - Cek Node.js version compatibility
   - Pastikan semua dependencies terinstall

2. **Database Connection Error**
   - Cek Supabase connection string
   - Pastikan database schema sudah dibuat

3. **Edge Function Error**
   - Cek environment variables
   - Cek function logs di Supabase dashboard

---

**🎉 Selamat! Fashion Park Anda sudah live 100% GRATIS!**

**Tidak perlu kartu kredit, tidak ada biaya tersembunyi!** 🆓✨
