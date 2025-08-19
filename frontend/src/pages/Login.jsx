import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { InlineNotification } from "../components";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks";


const roleToMainPage = {
  admin: "/admin/dashboard",
  kasir: "/kasir/transaksi",
  pemilik: "/pemilik/dashboard",
  pelanggan: "/",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showError } = useNotification();

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
    setError("");
    setIsLoading(true);
    
    try {
      const response = await api.post("/auth/login", { email, password });
      
      if (response.data.success) {
        // Login berhasil
        login(response.data.token, response.data.user);
        
        // Redirect berdasarkan role
        const role = response.data.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'kasir') {
          navigate('/kasir/dashboard');
        } else if (role === 'pemilik') {
          navigate('/pemilik/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login gagal";
      setError(errorMsg);
      showError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Navbar />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login
            </h2>
          </div>
          


          <form onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <InlineNotification
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}
            <div className="mb-4">
              <label className="block text-black mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${validationErrors.email ? 'border-red-500' : ''}`}
                required
                autoFocus
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div className="mb-6 relative">
              <label className="block text-black mb-2" htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={isLoading}
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 cursor-pointer">
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center mt-4 text-sm">
              <span 
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Lupa Password?
              </span>
            </div>
            <div className="text-center mt-2 text-sm">
              <span>Belum punya akun? </span>
              <span 
                className="text-blue-500 hover:underline cursor-pointer font-semibold"
                onClick={() => navigate('/register')}
              >
                Daftar di sini
              </span>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login; 