# User Management System

## Overview
Sistem manajemen user yang memungkinkan **admin** mengelola semua user dalam sistem dengan role-based access control. **Owner** tidak memiliki akses untuk mengelola user.

## User Roles

### 1. **Owner** (Pemilik)
- **Akses:** Laporan keuangan dan manajemen bisnis
- **Kemampuan:** 
  - Melihat laporan keuangan
  - Analisis bisnis dan strategi
  - Dashboard KPI
  - **TIDAK** mengelola user dalam sistem
  - **TIDAK** mengubah status user

### 2. **Admin** (Administrator)
- **Akses:** Semua fitur sistem + manajemen user
- **Kemampuan:**
  - Mengelola semua user (kasir, pelanggan, admin)
  - Mengubah status user (kecuali owner)
  - Akses penuh ke semua fitur sistem
  - Manajemen produk dan operasional

### 3. **Kasir**
- **Akses:** Transaksi dan manajemen pesanan
- **Kemampuan:**
  - Melihat dan memproses pesanan
  - Mengelola stok barang
  - Mencetak barcode
  - Akses terbatas sesuai role

### 4. **Pelanggan**
- **Akses:** Pembelian dan riwayat belanja
- **Kemampuan:**
  - Melihat katalog produk
  - Membuat pesanan
  - Melihat riwayat belanja
  - Tracking pesanan

## Features

### **Admin Panel** (`/admin/manajemen-user`)
- ✅ **View All Users:** Melihat semua user dalam sistem
- ✅ **Add User:** Menambah user baru dengan role yang sesuai
- ✅ **Edit User:** Mengubah data user (nama, email, telepon, alamat, role)
- ✅ **Toggle Status:** Mengaktifkan/nonaktifkan user
- ✅ **Delete User:** Menghapus user (dengan konfirmasi)
- ✅ **Search & Filter:** Mencari dan memfilter user berdasarkan role
- ✅ **Role Management:** Mengatur role user (pelanggan, kasir, admin)

### **Owner Panel** (`/pemilik/manajemen-user-pemilik`)
- ❌ **User Management:** Owner tidak memiliki akses untuk mengelola user
- ✅ **Business Focus:** Fokus pada laporan keuangan dan analisis bisnis
- ✅ **Strategic Decisions:** Pengambilan keputusan berdasarkan data

## Security Features

### **Authorization Rules**
1. **Admin** dapat mengelola user (kasir, pelanggan, admin) - **TIDAK** bisa mengelola owner
2. **Owner** tidak dapat mengakses manajemen user sama sekali
3. **Kasir** dan **Pelanggan** tidak dapat mengakses manajemen user

### **Role Creation Restrictions**
- **Admin** tidak bisa membuat user dengan role **owner**
- **Admin** hanya bisa membuat user dengan role: pelanggan, kasir, admin
- **Owner** tidak bisa membuat user apapun
- **Owner** hanya bisa dibuat melalui sistem atau database langsung

### **Status Management**
- Owner tidak bisa dinonaktifkan
- Admin dapat mengelola status user lain (kecuali owner)
- Admin tidak bisa mengubah status owner
- Password update hanya jika diisi (tidak kosong)

### **Role Hierarchy**
```
Owner (Level 4) - Laporan & Strategi Bisnis
├── Admin (Level 3) - Manajemen User & Sistem
├── Kasir (Level 2) - Transaksi & Operasional
└── Pelanggan (Level 1) - Pembelian & Konsumsi
```

## API Endpoints

### **User Management** (Admin Only)
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `PATCH /api/users/:id/status` - Toggle user status (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### **Role-specific Endpoints**
- `GET /api/users/admin-only` - Get admin users (admin only)
- `GET /api/users/kasir-pelanggan` - Get kasir & pelanggan users (admin only)

## Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  userId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('owner', 'admin', 'kasir', 'pelanggan') DEFAULT 'pelanggan',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage Examples

### **Creating a New User** (Admin Only)
```javascript
const newUser = {
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword",
  phone: "08123456789",
  address: "Jl. Contoh No. 123",
  role: "kasir"
};

await api.post("/users", newUser);
```

### **Toggling User Status** (Admin Only)
```javascript
await api.patch(`/users/${userId}/status`, {
  isActive: false
});
```

### **Updating User** (Admin Only)
```javascript
const updateData = {
  name: "John Updated",
  phone: "08123456789",
  role: "admin"
};

await api.put(`/users/${userId}`, updateData);
```

## Best Practices

### **Security**
1. Selalu validasi role admin sebelum operasi manajemen user
2. Gunakan middleware authorization untuk setiap endpoint
3. Log semua operasi manajemen user untuk audit trail
4. Owner tidak boleh memiliki akses ke endpoint user management

### **User Experience**
1. Berikan feedback yang jelas untuk setiap operasi
2. Konfirmasi sebelum menghapus user
3. Tampilkan deskripsi role untuk pemahaman yang lebih baik
4. Owner harus diarahkan ke fitur yang sesuai (laporan keuangan)

### **Performance**
1. Implementasi pagination untuk user list yang besar
2. Cache user data yang sering diakses
3. Optimasi query database dengan indexing

## Troubleshooting

### **Common Issues**
1. **403 Forbidden:** User tidak memiliki permission yang cukup
2. **404 Not Found:** User ID tidak ditemukan
3. **500 Server Error:** Database connection atau query error

### **Debug Tips**
1. Check user role in request headers
2. Verify database permissions
3. Check middleware configuration
4. Review API endpoint routes
5. Ensure owner is not trying to access user management

## Future Enhancements

### **Planned Features**
- [ ] Bulk user operations (import/export) - Admin only
- [ ] User activity logging - Admin only
- [ ] Advanced search and filtering - Admin only
- [ ] User permission matrix - Admin only
- [ ] Two-factor authentication
- [ ] User session management - Admin only

### **Owner Features** (Non-User Management)
- [ ] Advanced financial reporting
- [ ] Business intelligence dashboard
- [ ] Performance metrics and KPIs
- [ ] Strategic planning tools
- [ ] Market analysis reports
