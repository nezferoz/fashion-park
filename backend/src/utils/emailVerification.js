const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email verification utilities
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL_ADDRESS@gmail.com', // Ganti dengan email Gmail Anda
    pass: 'YOUR_GMAIL_APP_PASSWORD'       // Ganti dengan App Password
  }
});

// Store verification tokens (in production, use Redis or database)
const verificationTokens = new Map();

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: '"Fashion Park" <YOUR_GMAIL_ADDRESS@gmail.com>',
    to: email,
    subject: 'Verifikasi Email Anda',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verifikasi Email</h2>
        <p>Terima kasih telah mendaftar di Fashion Park!</p>
        <p>Untuk menyelesaikan pendaftaran, silakan klik tombol di bawah ini:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verifikasi Email
        </a>
        <p>Atau copy paste link berikut ke browser Anda:</p>
        <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${verificationUrl}
        </p>
        <hr style="margin: 20px 0;" />
        <p>Link ini akan kadaluarsa dalam 24 jam.</p>
        <p>Jika Anda tidak mendaftar di Fashion Park, abaikan email ini.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verifikasi terkirim ke: ${email}`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email verifikasi:", error);
    return false;
  }
};

const createVerificationToken = (email) => {
  const token = generateVerificationToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 jam
  
  verificationTokens.set(token, {
    email,
    expires,
    verified: false
  });
  
  return token;
};

const verifyEmailToken = (token) => {
  const verification = verificationTokens.get(token);
  
  if (!verification) {
    return { isValid: false, message: 'Token verifikasi tidak valid' };
  }
  
  if (verification.expires < Date.now()) {
    verificationTokens.delete(token);
    return { isValid: false, message: 'Token verifikasi sudah kadaluarsa' };
  }
  
  verification.verified = true;
  return { isValid: true, email: verification.email };
};

const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, verification] of verificationTokens.entries()) {
    if (verification.expires < now) {
      verificationTokens.delete(token);
    }
  }
};

// Cleanup expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  sendVerificationEmail,
  createVerificationToken,
  verifyEmailToken
};
