import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Memverifikasi email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Token verifikasi tidak ditemukan');
          return;
        }

        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        if (response.data.message) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Gagal memverifikasi email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleResend = async () => {
    try {
      setStatus('verifying');
      setMessage('Mengirim ulang email verifikasi...');
      
      // Get email from localStorage or redirect to login
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.email) {
        navigate('/login');
        return;
      }

      await api.post('/auth/resend-verification', { email: user.email });
      setStatus('success');
      setMessage('Email verifikasi telah dikirim ulang. Silakan cek email Anda.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Gagal mengirim ulang email verifikasi');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          )}
          
          {status === 'success' && (
            <div className="text-green-500 text-6xl mb-6">✅</div>
          )}
          
          {status === 'error' && (
            <div className="text-red-500 text-6xl mb-6">❌</div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'verifying' && 'Memverifikasi Email...'}
            {status === 'success' && 'Verifikasi Berhasil!'}
            {status === 'error' && 'Verifikasi Gagal'}
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'success' && (
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login Sekarang
            </button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleResend}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Kirim Ulang Email Verifikasi
              </button>
              
              <button
                onClick={handleLogin}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Kembali ke Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
