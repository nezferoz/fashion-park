import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import OTPVerification from "../components/OTPVerification";
import otpService from "../utils/otpService";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Form Registration, 2: OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi
    const errors = {};
    if (!name.trim()) errors.name = "Nama diperlukan";
    if (!email.trim()) errors.email = "Email diperlukan";
    if (!password.trim()) errors.password = "Password diperlukan";
    if (password.length < 6) errors.password = "Password minimal 6 karakter";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Store temporary user data
      const userData = { name, email, password };
      setTempUserData(userData);

      // Step 2: Send OTP
      const otpResult = await otpService.sendOTP(email, name);
      
      if (otpResult.success) {
        if (otpResult.mode === 'emailjs') {
          setSuccess("✅ Kode verifikasi berhasil dikirim ke email Anda!");
        } else {
          setSuccess("⚠️ Sistem dalam mode testing. Cek alert untuk kode verifikasi.");
        }
        setStep(2); // Move to OTP verification step
      } else {
        setError("Gagal mengirim kode verifikasi. Silakan coba lagi.");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat memproses registrasi");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = async (verifiedEmail) => {
    if (!tempUserData) {
      setError("Data registrasi tidak ditemukan. Silakan coba lagi.");
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      // Register user to database after OTP verification
      const response = await api.post("/auth/register", {
        name: tempUserData.name,
        email: tempUserData.email,
        password: tempUserData.password,
        email_verified: true // Mark as verified
      });
      
      if (response.data.success) {
        setSuccess("🎉 Registrasi berhasil! Email Anda telah terverifikasi. Silakan login.");
        // Clear data
        setTempUserData(null);
        setName('');
        setEmail('');
        setPassword('');
        setValidationErrors({});
        
        // Redirect ke login setelah 3 detik
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal setelah verifikasi");
      console.error("Final registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel OTP verification
  const handleCancelOTP = () => {
    setStep(1);
    setTempUserData(null);
    setError("");
    setSuccess("");
  };

  // Show OTP verification screen
  if (step === 2) {
    return (
      <>
        <Navbar />
        <OTPVerification
          email={email}
          onVerified={handleOTPVerified}
          onCancel={handleCancelOTP}
        />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Navbar />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} autoComplete="off">
            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
            {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">Nama</label>
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 ${validationErrors.name ? 'border-red-500' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                className={`w-full border rounded px-3 py-2 ${validationErrors.email ? 'border-red-500' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                className={`w-full border rounded px-3 py-2 ${validationErrors.password ? 'border-red-500' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengirim kode verifikasi...' : 'Register'}
            </button>
            <div className="text-center text-sm">
              Sudah punya akun?{' '}
              <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register; 