# 📧 Fashion Park Email Templates

## 🎯 Template yang Sudah Dibuat:

### 1. **OTP Verification Template**
- **File**: `fashion_park_otp_simple.html`
- **Untuk**: Registrasi dengan kode OTP
- **Variables**: `{{to_name}}`, `{{otp_code}}`, `{{expires_minutes}}`

### 2. **Reset Password Template** 
- **File**: `fashion_park_reset_password_simple.html`
- **Untuk**: Reset password via email
- **Variables**: `{{user_name}}`, `{{link}}`

## 🔧 Cara Setup di EmailJS:

### Step 1: Buat Template OTP Baru
1. Login ke **EmailJS Dashboard**
2. Pilih **Email Templates**
3. Klik **Create New Template**
4. **Template Name**: `Fashion Park OTP Verification`
5. **Copy paste** isi file `fashion_park_otp_simple.html`
6. **Save** dan catat **Template ID**

### Step 2: Buat Template Reset Password Baru  
1. Klik **Create New Template** lagi
2. **Template Name**: `Fashion Park Reset Password`
3. **Copy paste** isi file `fashion_park_reset_password_simple.html`
4. **Save** dan catat **Template ID**

### Step 3: Update Template ID di Code
1. **OTP Template**: Update `templateId` di `frontend/src/utils/otpService.js`
2. **Reset Password**: Update `templateId` di `frontend/src/utils/emailService.js`

## 📝 Template Variables:

### OTP Template Variables:
```
{{to_name}} - Nama user
{{otp_code}} - 6 digit kode OTP  
{{expires_minutes}} - Durasi expire (5 menit)
{{to_email}} - Email tujuan
```

### Reset Password Template Variables:
```
{{user_name}} - Nama user
{{link}} - URL reset password
{{to_email}} - Email tujuan
{{company_name}} - Fashion Park
{{support_email}} - support@fashionpark.com
{{website}} - www.fashionpark.com
{{year}} - Tahun sekarang
```

## 🎨 Design Features:

### ✅ Branding Konsisten:
- **Logo**: 👗 Fashion Park
- **Tagline**: "Your Style, Your Story"
- **Colors**: Gradient biru-ungu (#667eea → #764ba2)
- **Font**: System fonts (Apple/Segoe UI/Roboto)

### ✅ UI/UX Modern:
- **Responsive design**
- **Clear call-to-action buttons**
- **Security warnings**
- **Professional layout**
- **Bahasa Indonesia**

### ✅ Security Elements:
- **Expiry time warnings**
- **Don't share warnings**
- **Phishing protection tips**
- **Company contact info**

## 🚀 Next Steps:

1. **Copy template HTML** ke EmailJS
2. **Update Template IDs** di code
3. **Test OTP registration flow**
4. **Test reset password flow**
5. **Monitor email delivery**

## 🛠️ Troubleshooting:

### Jika Email Tidak Terkirim:
1. **Cek Template ID** benar
2. **Cek Service ID** aktif
3. **Cek Public Key** valid
4. **Cek browser console** untuk error
5. **Cek Gmail connection** di EmailJS

### Fallback Mode:
- Sistem akan show **alert popup** jika EmailJS gagal
- Alert berisi **OTP code** atau **reset token**
- User tetap bisa lanjut proses manual

---

**Template siap digunakan!** 🎉
