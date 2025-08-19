import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_zzpewh3', // Service ID dari EmailJS dashboard
  templateId: 'template_cesn3ap', // Template ID yang benar dari screenshot  
  publicKey: '72KU-XT4Q36-MqGVq' // Public Key dari EmailJS dashboard
};

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.serviceId !== 'service_your_id' && 
         EMAILJS_CONFIG.templateId !== 'template_your_id' && 
         EMAILJS_CONFIG.publicKey !== 'your_public_key';
};

class EmailService {
  constructor() {
    // Initialize EmailJS dengan public key
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, username = 'User') {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    // Check if EmailJS is configured
    if (!isEmailJSConfigured()) {
      console.log('⚠️ EMAILJS NOT CONFIGURED - Using fallback mode');
      this.showFallbackAlert(email, resetToken, resetUrl, 'EmailJS not configured');
      return {
        success: true,
        messageId: 'not-configured',
        mode: 'alert',
        token: resetToken
      };
    }

    try {
      console.log('📧 SENDING EMAIL VIA EMAILJS...');
      console.log('🔧 Service ID:', EMAILJS_CONFIG.serviceId);
      console.log('📄 Template ID:', EMAILJS_CONFIG.templateId);
      console.log('🔑 Public Key:', EMAILJS_CONFIG.publicKey);
      console.log('📤 To:', email);
      console.log('👤 Username:', username);
      console.log('🔗 Reset URL:', resetUrl);
      
      const templateParams = {
        to_email: email,
        to_name: username || 'Pelanggan',
        user_name: username || 'Pelanggan',
        reset_token: resetToken,
        reset_url: resetUrl,
        link: resetUrl, // Link untuk tombol reset password
        from_name: 'Fashion Park',
        email: email,
        // Fashion Park branding
        company_name: 'Fashion Park',
        support_email: 'support@fashionpark.com',
        website: 'www.fashionpark.com',
        year: new Date().getFullYear(),
        // Alternative parameter names for compatibility
        token: resetToken,
        url: resetUrl
      };

      console.log('📋 Template Params:', templateParams);

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ EMAILJS SUCCESS:', response);
      return {
        success: true,
        messageId: response.text,
        mode: 'emailjs'
      };

    } catch (error) {
      console.error('❌ EMAILJS ERROR:', error);
      this.showFallbackAlert(email, resetToken, resetUrl, error.message || 'Unknown error');
      
      return {
        success: true,
        messageId: 'console-fallback',
        mode: 'alert',
        token: resetToken,
        error: error.message
      };
    }
  }

  // Show fallback alert with token
  showFallbackAlert(email, resetToken, resetUrl, errorReason) {
    const errorMsg = `
🚨 EmailJS Error: ${errorReason}

📧 TESTING MODE - Token untuk Manual Reset:

🔑 Reset Token: ${resetToken}

🔗 Reset URL: ${resetUrl}

📋 Cara Manual:
1. Copy token di atas
2. Buka halaman: ${window.location.origin}/reset-password
3. Paste token dan reset password

📧 Target Email: ${email}

⚙️ Troubleshooting:
- Pastikan EmailJS service aktif
- Cek template ID benar
- Cek public key valid
- Cek browser console untuk detail error
    `;
    
    alert(errorMsg);
  }
}

export default new EmailService();
