import React, { useState, useEffect } from 'react';
import otpService from '../utils/otpService';

const OTPVerification = ({ email, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const status = otpService.getOTPStatus();
      if (status.exists && !status.expired) {
        setTimeLeft(status.timeLeft);
        setCanResend(false);
      } else {
        setTimeLeft(0);
        setCanResend(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan kode OTP 6 digit');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = otpService.verifyOTP(otpCode);
      
      if (result.success) {
        setMessage(result.message);
        setTimeout(() => {
          onVerified(result.email);
        }, 1000);
      } else {
        setError(result.message);
        if (result.remainingAttempts === 0) {
          setTimeout(() => {
            onCancel();
          }, 2000);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat verifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await otpService.sendOTP(email);
      if (result.success) {
        setMessage('Kode OTP baru telah dikirim!');
        setOtp(['', '', '', '', '', '']);
        setCanResend(false);
      } else {
        setError('Gagal mengirim ulang OTP');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim ulang OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-blue-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Verifikasi Email</h2>
          <p className="text-gray-600">
            Kami telah mengirim kode verifikasi 6 digit ke:
          </p>
          <p className="font-semibold text-blue-600 mt-1">{email}</p>
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

        <div className="mb-6">
          <label className="block text-black mb-3 text-center font-medium">
            Masukkan Kode Verifikasi
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                maxLength="1"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
        </button>

        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-gray-600">
              Kirim ulang dalam: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Mengirim...' : 'Kirim Ulang Kode'}
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Kembali ke registrasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
