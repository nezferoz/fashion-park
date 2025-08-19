# Localhost Development Setup

## Cara Menggunakan Localhost untuk Development

### 1. Backend (Port 5000)
Backend sudah dikonfigurasi untuk berjalan di localhost:5000. Untuk menjalankan:

```bash
cd backend
npm install
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

### 2. Frontend (Port 3000)
Frontend akan berjalan di localhost:3000 dan akan otomatis menggunakan backend localhost:5000.

```bash
cd frontend
npm install
npm start
```

Frontend akan berjalan di: `http://localhost:3000`

### 3. Konfigurasi Environment Variables (Opsional)
Jika ingin mengatur API URL secara eksplisit, buat file `.env` di folder `frontend`:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Prioritas URL (dari yang tertinggi):
1. `window.__API_URL__` (untuk override runtime)
2. `process.env.REACT_APP_API_URL` (dari .env file)
3. `https://1837c60c25d5.ngrok-free.app` (ngrok fallback)
4. `http://localhost:5000` (localhost fallback)

### 5. CORS Configuration
Backend sudah dikonfigurasi untuk menerima request dari:
- `http://localhost:3000`
- `https://localhost:3000`
- Domain ngrok
- Request tanpa origin

### 6. Troubleshooting
- Pastikan backend berjalan di port 5000
- Pastikan frontend berjalan di port 3000
- Check console browser untuk error CORS
- Pastikan tidak ada firewall yang memblokir localhost
