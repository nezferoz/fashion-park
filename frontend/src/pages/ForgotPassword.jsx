import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { useLoading } from '../context/LoadingContext';
import emailService from '../utils/emailService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { setIsLoading } = useLoading();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email tidak boleh kosong";
    if (!emailRegex.test(email)) return "Format email tidak valid";
    if (email.length > 254) return "Email terlalu panjang";
    
    // Additional validation for domain
    const [localPart, domain] = email.split('@');
    if (!domain || !domain.includes('.')) return "Domain email tidak valid";
    
    // Check for valid TLD
    const tld = domain.split('.').pop();
    if (tld.length < 2) return "Domain email tidak valid";
    
    // Check for common invalid domains
    const invalidDomains = ['test', 'example', 'localhost', 'invalid'];
    if (invalidDomains.includes(domain.toLowerCase())) return "Domain email tidak valid";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setValidationErrors({});
    
    // Client-side validation
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationErrors({ email: emailError });
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Generate reset token from backend
      console.log('🔄 Step 1: Generating reset token...');
      const tokenRes = await api.post('/auth/forgot-password-token', { email });
      
      if (!tokenRes.data.success || !tokenRes.data.token) {
        setMessage(tokenRes.data.message);
        return;
      }

      const { token, username } = tokenRes.data;
      console.log('✅ Step 1 Complete: Token generated');

      // Step 2: Send email via EmailJS
      console.log('🔄 Step 2: Sending email via EmailJS...');
      const emailResult = await emailService.sendPasswordResetEmail(email, token, username);
      
      if (emailResult.success) {
        if (emailResult.mode === 'emailjs') {
          setMessage('✅ Email reset password berhasil dikirim! Silakan cek inbox email Anda.');
        } else if (emailResult.mode === 'alert') {
          setMessage('⚠️ Email service belum dikonfigurasi. Token sudah ditampilkan untuk testing.');
        }
        console.log('✅ Step 2 Complete: Email sent via', emailResult.mode);
      } else {
        setError('Gagal mengirim email. Silakan coba lagi.');
      }

    } catch (err) {
      console.error('❌ Forgot password error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-blue-100">
          <h2 className="text-2xl font-bold text-center text-black mb-6">Lupa Password</h2>
          <p className="text-center text-gray-600 mb-6">Masukkan email Anda. Kami akan mengirimkan instruksi untuk mereset password Anda.</p>
          <form onSubmit={handleSubmit}>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            <div className="mb-4">
              <label className="block text-black mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${validationErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
            >
              Kirim Instruksi
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword; 