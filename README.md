# Fashion Park - Sistem Manajemen Inventori

## 📋 Deskripsi
Sistem manajemen inventori untuk toko fashion dengan fitur barcode unik per ukuran produk, manajemen stok, dan laporan penjualan.

## 🏗️ Struktur Project

```
fashion-park/
├── backend/                 # Backend API (Node.js)
│   ├── src/                # Source code
│   ├── prisma/             # Database schema & migrations
│   ├── package.json        # Backend dependencies
│   └── db_schema.sql       # Database schema
├── frontend/               # Frontend (React/Vue)
│   ├── src/                # Source code
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── docs/                   # Dokumentasi
└── database_migration_no_color.sql  # Script migrasi database
```

## 🚀 Fitur Utama

### ✅ Manajemen Produk
- Tambah, edit, hapus produk
- Kategori produk
- Gambar produk
- Status aktif/nonaktif

### ✅ Variant Produk
- Ukuran berbeda (S, M, L, XL, dll)
- Barcode unik per ukuran
- SKU per variant
- Stok terpisah per ukuran

### ✅ Manajemen Stok
- Tracking stok per ukuran
- Alert stok menipis
- Riwayat pergerakan stok
- Input/output stok

### ✅ Sistem Barcode
- Barcode unik per ukuran produk
- Format: `PROD{product_id}VAR{variant_id}`
- SKU mudah dibaca: `SKU{product_id}-{SIZE}-{variant_id}`
- Auto-generate barcode & SKU

### ✅ Laporan & Analytics
- Laporan penjualan
- Laporan stok
- Grafik penjualan
- Export data

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication

### Frontend
- **React/Vue.js** - Frontend framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📦 Instalasi

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```sql
-- Jalankan script migrasi
source database_migration_no_color.sql
```

## 🗄️ Database Schema

### Tabel Utama
- `products` - Data produk utama
- `product_variants` - Variant produk dengan barcode unik
- `categories` - Kategori produk
- `users` - User management
- `stock_movements` - Riwayat pergerakan stok
- `transactions` - Transaksi penjualan

### Struktur Barcode
```sql
-- Format: PROD{product_id}VAR{variant_id}
-- Contoh: PROD000001VAR0001

-- Format SKU: SKU{product_id}-{SIZE}-{variant_id}
-- Contoh: SKU000001-S-0001
```

## 🔧 Konfigurasi

### Environment Variables
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/fashion_park"

# JWT
JWT_SECRET="your-secret-key"

# Server
PORT=3000
NODE_ENV=development
```

## 📱 API Endpoints

### Products
- `GET /api/products` - Daftar produk
- `POST /api/products` - Tambah produk
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Hapus produk

### Product Variants
- `GET /api/variants` - Daftar variant
- `POST /api/variants` - Tambah variant
- `GET /api/variants/barcode/:barcode` - Cari berdasarkan barcode

### Stock Management
- `GET /api/stock` - Status stok
- `POST /api/stock/movement` - Input/output stok
- `GET /api/stock/low` - Stok menipis

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Monitoring

### Stok Menipis
```sql
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    pv.barcode
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.stock_quantity < 10
ORDER BY pv.stock_quantity ASC;
```

### Cari Produk berdasarkan Barcode
```sql
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    p.price
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.barcode = 'PROD000001VAR0001';
```

## 🔄 Migrasi Database

Untuk mengubah struktur database agar mendukung barcode per ukuran:

1. **Backup database**
2. **Jalankan script migrasi:**
   ```sql
   source database_migration_no_color.sql
   ```
3. **Test dengan data sample**
4. **Update aplikasi web**

## 📝 Changelog

### v1.0.0
- ✅ Sistem manajemen produk dasar
- ✅ Barcode unik per ukuran
- ✅ Manajemen stok
- ✅ Laporan penjualan

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Email:** your-email@example.com
- **Project Link:** [https://github.com/yourusername/fashion-park](https://github.com/yourusername/fashion-park)

---

**Fashion Park** - Sistem manajemen inventori yang efisien dengan barcode unik per ukuran! 🏷️ 