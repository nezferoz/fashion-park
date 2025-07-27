const nodemailer = require('nodemailer');

// =================================================================
// TODO: GANTI DENGAN KREDENSIAL GMAIL ANDA
// =================================================================
// 1. Pastikan Anda sudah mengaktifkan Verifikasi 2 Langkah di akun Google Anda.
// 2. Buat "App Password" khusus untuk aplikasi ini di pengaturan keamanan Google Anda.
// 3. Masukkan email dan App Password di bawah ini.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL_ADDRESS@gmail.com', // <-- GANTI DENGAN EMAIL GMAIL ANDA
    pass: 'YOUR_GMAIL_APP_PASSWORD'       // <-- GANTI DENGAN 16 KARAKTER APP PASSWORD
  }
});

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
  
  const mailOptions = {
    from: '"Fashion Park" <YOUR_GMAIL_ADDRESS@gmail.com>', // Pastikan ini sama dengan user di atas
    to: to,
    subject: 'Reset Password Akun Anda',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Password</h2>
        <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p>
        <p>Gunakan kode OTP berikut untuk melanjutkan:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">
          ${token}
        </p>
        <p>Atau, Anda bisa klik link di bawah ini untuk langsung ke halaman reset:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <hr style="margin: 20px 0;" />
        <p>Jika Anda tidak meminta reset password ini, mohon abaikan email ini.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email reset password terkirim ke: ${to}`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    // Di production, jangan kirim detail error ke user.
    // Untuk pengembangan, kita bisa throw error agar tahu masalahnya.
    throw new Error('Gagal mengirim email. Periksa konfigurasi dan kredensial Anda.');
  }
};

module.exports = { sendPasswordResetEmail }; 