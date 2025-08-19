import React, { useState } from 'react';
import OTPVerification from '../components/OTPVerification';
import otpService from '../utils/otpService';

const TestOTP = () => {
  const [step, setStep] = useState(1); // 1: Input Email, 2: Verify OTP
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email diperlukan');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await otpService.sendOTP(email, username || 'User');
      
      if (result.success) {
        if (result.mode === 'emailjs') {
          setMessage('✅ Kode OTP berhasil dikirim ke email Anda!');
        } else {
          setMessage('⚠️ EmailJS dalam mode testing. Cek alert untuk kode OTP.');
        }
        setStep(2);
      } else {
        setError('Gagal mengirim OTP. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (verifiedEmail) => {
    alert(`🎉 OTP berhasil diverifikasi untuk: ${verifiedEmail}\n\nSekarang user bisa dilanjutkan ke proses registrasi!`);
    // Reset untuk testing ulang
    setStep(1);
    setEmail('');
    setUsername('');
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setStep(1);
    setMessage('');
    setError('');
  };

  if (step === 2) {
    return (
      <OTPVerification
        email={email}
        onVerified={handleOTPVerified}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-blue-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🧪</span>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Test OTP System</h2>
          <p className="text-gray-600">
            Test sistem OTP dengan EmailJS
          </p>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOTP}>
          <div className="mb-4">
            <label className="block text-black mb-2" htmlFor="username">
              Nama (Opsional)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div className="mb-6">
            <label className="block text-black mb-2" htmlFor="email">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>📧 Email akan dikirim via EmailJS</p>
          <p>⏰ Kode OTP berlaku 5 menit</p>
          <p>🔢 Format: 6 digit angka</p>
        </div>
      </div>
    </div>
  );
};

export default TestOTP;
