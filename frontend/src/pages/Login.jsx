import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      let redirectPath;
      if (res.data.user.role === "pelanggan") {
        redirectPath = location.state?.from?.pathname || "/";
      } else if (res.data.user.role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (res.data.user.role === "kasir") {
        redirectPath = "/kasir/transaksi";
      } else if (res.data.user.role === "pemilik") {
        redirectPath = "/pemilik/dashboard";
      } else {
        redirectPath = "/";
      }
      window.location.href = redirectPath;
    } catch (err) {
      const msg = err.response?.data?.message || "Login gagal";
      setError(msg);
      toast.error(msg, { position: "top-center" });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-blue-100">
          <h2 className="text-2xl font-bold text-center text-black mb-6">Login</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            <div className="mb-4">
              <label className="block text-black mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                autoFocus
              />
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
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 cursor-pointer">
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-400 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
            >
              Login
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