import emailjs from '@emailjs/browser';

// EmailJS Configuration for OTP
const EMAILJS_CONFIG = {
  serviceId: 'service_zzpewh3',
  templateId: 'template_csg2tkh', // Template One-Time Password yang sudah ada
  publicKey: '72KU-XT4Q36-MqGVq'
};

class OTPService {
  constructor() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    this.otpExpireMinutes = 5; // OTP expire dalam 5 menit
  }

  // Generate 6 digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via EmailJS
  async sendOTP(email, username = 'User') {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + (this.otpExpireMinutes * 60 * 1000);

      console.log('📧 SENDING OTP VIA EMAILJS...');
      console.log('📤 To:', email);
      console.log('🔢 OTP:', otp);
      console.log('⏰ Expires in:', this.otpExpireMinutes, 'minutes');

      // Store OTP in localStorage with expiry
      const otpData = {
        otp: otp,
        email: email,
        expiresAt: expiresAt,
        attempts: 0,
        maxAttempts: 3
      };
      localStorage.setItem('otp_data', JSON.stringify(otpData));

      const templateParams = {
        to_email: email,
        to_name: username || 'Pelanggan',
        otp_code: otp,
        verification_code: otp,
        expires_minutes: this.otpExpireMinutes,
        from_name: 'Fashion Park',
        email: email,
        user_name: username || 'Pelanggan',
        // Common OTP template parameters
        code: otp,
        passcode: otp,
        token: otp,
        // Fashion Park branding
        company_name: 'Fashion Park',
        support_email: 'support@fashionpark.com',
        website: 'www.fashionpark.com',
        year: new Date().getFullYear(),
        expires_time: new Date(expiresAt).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta'
        })
      };

      console.log('📋 Template Params:', templateParams);

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ OTP EMAIL SUCCESS:', response);
      return {
        success: true,
        messageId: response.text,
        mode: 'emailjs',
        otp: otp, // For testing only, remove in production
        expiresAt: expiresAt
      };

    } catch (error) {
      console.error('❌ OTP EMAIL ERROR:', error);
      
      // Fallback: Show OTP in alert
      const otp = this.generateOTP();
      const expiresAt = Date.now() + (this.otpExpireMinutes * 60 * 1000);
      
      const otpData = {
        otp: otp,
        email: email,
        expiresAt: expiresAt,
        attempts: 0,
        maxAttempts: 3
      };
      localStorage.setItem('otp_data', JSON.stringify(otpData));

      const errorMsg = `
🚨 EmailJS Error: ${error.message || 'Unknown error'}

📧 TESTING MODE - Kode OTP:

🔢 OTP Code: ${otp}

⏰ Valid selama: ${this.otpExpireMinutes} menit

📧 Target Email: ${email}

📝 Cara Testing:
1. Copy kode OTP di atas
2. Paste di form verifikasi
3. Klik "Verifikasi"
      `;
      
      alert(errorMsg);
      
      return {
        success: true,
        messageId: 'console-fallback',
        mode: 'alert',
        otp: otp,
        error: error.message
      };
    }
  }

  // Verify OTP
  verifyOTP(inputOTP) {
    try {
      const otpDataStr = localStorage.getItem('otp_data');
      if (!otpDataStr) {
        return {
          success: false,
          message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.'
        };
      }

      const otpData = JSON.parse(otpDataStr);
      const now = Date.now();

      // Check if OTP expired
      if (now > otpData.expiresAt) {
        localStorage.removeItem('otp_data');
        return {
          success: false,
          message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
        };
      }

      // Check attempts
      if (otpData.attempts >= otpData.maxAttempts) {
        localStorage.removeItem('otp_data');
        return {
          success: false,
          message: 'Terlalu banyak percobaan. Silakan minta kode baru.'
        };
      }

      // Verify OTP
      if (inputOTP === otpData.otp) {
        localStorage.removeItem('otp_data');
        console.log('✅ OTP VERIFIED SUCCESSFULLY');
        return {
          success: true,
          message: 'Kode OTP berhasil diverifikasi!',
          email: otpData.email
        };
      } else {
        // Increment attempts
        otpData.attempts += 1;
        localStorage.setItem('otp_data', JSON.stringify(otpData));
        
        const remainingAttempts = otpData.maxAttempts - otpData.attempts;
        return {
          success: false,
          message: `Kode OTP salah. Sisa percobaan: ${remainingAttempts}`,
          remainingAttempts: remainingAttempts
        };
      }

    } catch (error) {
      console.error('❌ OTP VERIFICATION ERROR:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat verifikasi OTP.'
      };
    }
  }

  // Resend OTP
  async resendOTP() {
    try {
      const otpDataStr = localStorage.getItem('otp_data');
      if (!otpDataStr) {
        throw new Error('No OTP data found');
      }

      const otpData = JSON.parse(otpDataStr);
      return await this.sendOTP(otpData.email);
      
    } catch (error) {
      console.error('❌ RESEND OTP ERROR:', error);
      return {
        success: false,
        message: 'Gagal mengirim ulang OTP. Silakan coba lagi.'
      };
    }
  }

  // Check OTP status
  getOTPStatus() {
    try {
      const otpDataStr = localStorage.getItem('otp_data');
      if (!otpDataStr) {
        return { exists: false };
      }

      const otpData = JSON.parse(otpDataStr);
      const now = Date.now();
      const timeLeft = Math.max(0, otpData.expiresAt - now);
      const minutesLeft = Math.floor(timeLeft / 60000);
      const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

      return {
        exists: true,
        expired: now > otpData.expiresAt,
        timeLeft: timeLeft,
        minutesLeft: minutesLeft,
        secondsLeft: secondsLeft,
        attempts: otpData.attempts,
        maxAttempts: otpData.maxAttempts,
        email: otpData.email
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

export default new OTPService();
