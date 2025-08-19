# Sistem Notifikasi yang Konsisten

Sistem notifikasi ini dirancang untuk memberikan UI yang konsisten di seluruh aplikasi, menggantikan berbagai pola notifikasi yang tidak seragam.

## 🎯 **Tujuan**

- **Konsistensi UI**: Semua notifikasi memiliki desain yang sama
- **Reusability**: Komponen dapat digunakan di berbagai halaman
- **Flexibility**: Mendukung berbagai jenis notifikasi dan posisi
- **Accessibility**: Mendukung screen reader dan keyboard navigation

## 📦 **Komponen yang Tersedia**

### **1. Notification (Komponen Utama)**
```jsx
import { Notification } from '../components';

<Notification
  type="success"           // 'success', 'error', 'warning', 'info'
  title="Berhasil!"        // Optional - judul notifikasi
  message="Data tersimpan" // Pesan utama
  show={true}              // Tampilkan/sembunyikan
  autoClose={true}         // Auto close setelah duration
  duration={5000}          // Durasi dalam ms
  position="top-right"     // Posisi notifikasi
  closable={true}          // Tampilkan tombol close
  onClose={() => {}}       // Callback saat close
/>
```

### **2. InlineNotification (Banner)**
```jsx
import { InlineNotification } from '../components';

<InlineNotification
  type="error"
  message="Terjadi kesalahan"
  onClose={() => setError("")}
/>
```

### **3. ToastNotification (Floating)**
```jsx
import { ToastNotification } from '../components';

<ToastNotification
  type="success"
  message="Berhasil disimpan!"
  duration={3000}
/>
```

### **4. StatusNotification (Centered)**
```jsx
import { StatusNotification } from '../components';

<StatusNotification
  type="info"
  message="Memproses data..."
/>
```

## 🎨 **Jenis Notifikasi**

| Tipe | Warna | Icon | Penggunaan |
|------|-------|------|------------|
| `success` | 🟢 Hijau | ✓ | Operasi berhasil |
| `error` | 🔴 Merah | ⚠️ | Error/kegagalan |
| `warning` | 🟡 Kuning | ⚠️ | Peringatan |
| `info` | 🔵 Biru | ℹ️ | Informasi |

## 📍 **Posisi Notifikasi**

| Posisi | Deskripsi |
|--------|-----------|
| `top-right` | Pojok kanan atas (default) |
| `top-left` | Pojok kiri atas |
| `bottom-right` | Pojok kanan bawah |
| `bottom-left` | Pojok kiri bawah |
| `inline` | Dalam alur konten (banner) |

## 🪝 **Hook useNotification**

```jsx
import { useNotification } from '../hooks';

const MyComponent = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    showToast,
    showInline,
    clearAll 
  } = useNotification();

  const handleSuccess = () => {
    showSuccess('Data berhasil disimpan!');
  };

  const handleError = () => {
    showError('Terjadi kesalahan!');
  };

  const handleWarning = () => {
    showWarning('Stok hampir habis!');
  };

  const handleInfo = () => {
    showInfo('Memproses data...');
  };

  // Notifikasi toast dengan custom options
  const handleToast = () => {
    showToast('success', 'Berhasil!', 'Data tersimpan', {
      duration: 2000,
      position: 'bottom-right'
    });
  };

  // Notifikasi inline
  const handleInline = () => {
    showInline('error', 'Gagal menyimpan', 'Error', {
      className: 'mb-4'
    });
  };
};
```

## 🔄 **Migrasi dari Sistem Lama**

### **Sebelum (Tidak Konsisten):**
```jsx
// Pola 1: Alert browser
alert('Stok tidak mencukupi!');

// Pola 2: Inline div dengan styling berbeda
{error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

// Pola 3: Toast dengan styling custom
{showSuccessNotification && (
  <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg">
    {successMessage}
  </div>
)}

// Pola 4: Status text biasa
setStatus('Pembayaran sukses!');
```

### **Sesudah (Konsisten):**
```jsx
// Gunakan hook useNotification
const { showSuccess, showError, showWarning } = useNotification();

// Success notification
showSuccess('Pembayaran berhasil!');

// Error notification
showError('Gagal memproses pembayaran');

// Warning notification
showWarning('Stok hampir habis');

// Inline notification untuk error state
{error && (
  <InlineNotification
    type="error"
    message={error}
    onClose={() => setError("")}
  />
)}
```

## 📱 **Responsive Design**

- **Mobile**: Notifikasi menyesuaikan lebar layar
- **Tablet**: Optimal untuk layar medium
- **Desktop**: Full width dengan max-width yang sesuai

## ♿ **Accessibility Features**

- **ARIA Labels**: Tombol close memiliki label yang jelas
- **Keyboard Navigation**: Dapat diakses dengan keyboard
- **Screen Reader**: Mendukung screen reader
- **Focus Management**: Focus management yang baik

## 🎨 **Customization**

### **Custom Styling:**
```jsx
<Notification
  type="success"
  message="Custom styling"
  className="custom-class"
  style={{ backgroundColor: '#custom-color' }}
/>
```

### **Custom Duration:**
```jsx
showSuccess('Berhasil!', 'Success', { duration: 10000 }); // 10 detik
```

### **Custom Position:**
```jsx
showToast('info', 'Info message', 'Info', { position: 'bottom-left' });
```

## 🚀 **Best Practices**

1. **Gunakan hook useNotification** untuk notifikasi toast
2. **Gunakan InlineNotification** untuk error/success state di form
3. **Gunakan StatusNotification** untuk status yang perlu ditampilkan di tengah
4. **Hindari alert()** browser - gunakan sistem notifikasi yang konsisten
5. **Beri feedback yang jelas** kepada user
6. **Auto-close** untuk notifikasi sukses, manual close untuk error

## 📝 **Contoh Implementasi Lengkap**

```jsx
import React, { useState } from 'react';
import { InlineNotification } from '../components';
import { useNotification } from '../hooks';

const MyForm = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showSuccess, showError, showWarning } = useNotification();

  const handleSubmit = async (formData) => {
    try {
      // Proses form
      await api.submit(formData);
      
      // Success feedback
      setSuccess('Data berhasil disimpan!');
      showSuccess('Data berhasil disimpan!');
      
    } catch (err) {
      // Error feedback
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div>
      {/* Error notification */}
      {error && (
        <InlineNotification
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Success notification */}
      {success && (
        <InlineNotification
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Form content */}
      <form onSubmit={handleSubmit}>
        {/* ... form fields ... */}
      </form>
    </div>
  );
};
```

## 🔧 **Troubleshooting**

### **Notifikasi tidak muncul:**
1. Pastikan komponen di-import dengan benar
2. Pastikan hook useNotification digunakan di component
3. Cek console untuk error

### **Styling tidak konsisten:**
1. Pastikan menggunakan komponen yang tepat
2. Cek apakah ada CSS custom yang override
3. Pastikan Tailwind CSS ter-load dengan benar

### **Notifikasi tidak auto-close:**
1. Pastikan `autoClose={true}` (default)
2. Pastikan `duration > 0`
3. Cek apakah ada error di console
