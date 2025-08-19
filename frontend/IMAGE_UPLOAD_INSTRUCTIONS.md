# 📸 Cara Upload Gambar Fashion Park

## 🎯 **Gambar yang Diperlukan:**

### 1. **depan.jpeg**
- **Lokasi:** `frontend/public/images/depan.jpeg`
- **Deskripsi:** Gambar depan toko Fashion Park yang menampilkan:
  - Nama "Fashion Park" di atas pintu
  - Jendela toko dengan display pakaian
  - Motor yang parkir di depan
  - Tiang merah-putih bergaris
- **Ukuran yang disarankan:** 800x600px atau lebih besar
- **Format:** JPG atau PNG

### 2. **dalam.jpeg**
- **Lokasi:** `frontend/public/images/dalam.jpeg`
- **Deskripsi:** Gambar dalam toko yang menampilkan:
  - Rak-rak pakaian dengan berbagai warna
  - Banner "PROMO 50%" di dinding
  - Cermin yang memantulkan banner
  - Sandal dan topi di rak atas
- **Ukuran yang disarankan:** 800x600px atau lebih besar
- **Format:** JPG atau PNG

## 📁 **Langkah Upload:**

### **Metode 1: Copy-Paste Manual**
1. Buka folder `frontend/public/images/`
2. Copy gambar dari folder Anda
3. Paste ke folder `images/`
4. Rename menjadi `depan.jpeg` dan `dalam.jpeg`

### **Metode 2: Drag & Drop**
1. Buka folder `frontend/public/images/` di File Explorer
2. Drag gambar dari folder Anda ke folder `images/`
3. Rename file sesuai nama yang diperlukan

### **Metode 3: Command Line (PowerShell)**
```powershell
# Masuk ke folder frontend
cd frontend

# Copy gambar (ganti path sesuai lokasi gambar Anda)
copy "C:\path\to\gambar\depan.jpg" "public\images\depan.jpeg"
copy "C:\path\to\gambar\dalam.jpg" "public\images\dalam.jpeg"
```

## ✅ **Verifikasi Upload:**
1. Pastikan file ada di `frontend/public/images/`
2. Pastikan nama file tepat (case sensitive)
3. Restart aplikasi frontend jika diperlukan
4. Refresh halaman Home

## 🔧 **Troubleshooting:**

### **Gambar tidak muncul:**
- Periksa nama file (harus tepat sama)
- Periksa format file (JPG/PNG)
- Pastikan file tidak corrupt
- Cek console browser untuk error

### **Gambar blur/pecah:**
- Gunakan gambar berkualitas tinggi
- Ukuran minimal 800x600px
- Format JPG untuk foto, PNG untuk grafis

## 🎨 **Tips Desain:**
- **Depan Toko:** Tampilkan branding yang jelas
- **Dalam Toko:** Highlight promo dan koleksi
- **Kualitas:** Gunakan foto yang tajam dan terang
- **Komposisi:** Pastikan elemen penting terlihat jelas

## 📱 **Responsive Design:**
- Gambar akan otomatis responsive
- Mobile: Gambar akan stack vertikal
- Desktop: Gambar akan tampil berdampingan
- Tablet: Layout akan menyesuaikan

---

**Setelah upload selesai, gambar akan otomatis muncul menggantikan placeholder!** 🎉
