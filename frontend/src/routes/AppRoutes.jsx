import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import Sidebar from "../components/Sidebar";
import DashboardAdmin from "../pages/DashboardAdmin";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import Katalog from "../pages/Katalog";
import Login from "../pages/Login";
import ProductDetail from "../pages/ProductDetail";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import TestOTP from "../pages/TestOTP";
import AkunSaya from "../pages/admin/AkunSaya";
import DetailPesananAdmin from "../pages/admin/DetailPesanan";
import KelolaPesanan from "../pages/admin/KelolaPesanan";
import ManajemenProduk from "../pages/admin/ManajemenProduk";
import ManajemenUser from "../pages/admin/ManajemenUser";
import PengaturanAlamatPengirim from "../pages/admin/PengaturanAlamatPengirim";
import RiwayatTransaksi from "../pages/admin/RiwayatTransaksi";
import AkunSayaKasir from "../pages/kasir/AkunSayaKasir";
import KelolaPesananKasir from "../pages/kasir/KelolaPesananKasir";
import ManajemenBarang from "../pages/kasir/ManajemenBarang";
import RiwayatTransaksiKasir from "../pages/kasir/RiwayatTransaksiKasir";
import TransaksiPenjualan from "../pages/kasir/TransaksiPenjualan";
import KeranjangBelanja from "../pages/pelanggan/KeranjangBelanja";
import Pembayaran from "../pages/pelanggan/Pembayaran";
import Profile from "../pages/pelanggan/Profile";
import RiwayatBelanja from "../pages/pelanggan/RiwayatBelanja";
import StatusPembayaran from "../pages/pelanggan/StatusPembayaran";
import StatusPesanan from "../pages/pelanggan/StatusPesanan";
import DetailPesanan from "../pages/pelanggan/DetailPesanan";
import AkunSayaPemilik from "../pages/pemilik/AkunSayaPemilik";
import DashboardKPI from "../pages/pemilik/DashboardKPI";
import LaporanPemilik from "../pages/pemilik/LaporanPemilik";
import RiwayatTransaksiPemilik from "../pages/pemilik/RiwayatTransaksiPemilik";

import { useAuth } from "../hooks/useAuth";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  console.log("AppRoutes: user=", user, "isLoading=", isLoading);
  
  let role = user?.role;
  // Mapping owner ke pemilik agar sidebar muncul
  if (role === 'owner') role = 'pemilik';
  
  // Sidebar hanya untuk admin, pemilik, kasir
  // Pelanggan TIDAK perlu sidebar di semua halaman
  const showSidebar = ["admin", "pemilik", "kasir"].includes(role);
  
  console.log("AppRoutes: role=", role, "showSidebar=", showSidebar);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log("AppRoutes: showing loading spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "ml-56" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/produk/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/test-otp" element={<TestOTP />} />
          
          {/* Rute yang dilindungi */}
          <Route path="/cart" element={<PrivateRoute role="pelanggan"><KeranjangBelanja /></PrivateRoute>} />
          <Route path="/admin/produk" element={<PrivateRoute role="admin"><ManajemenProduk /></PrivateRoute>} />
          <Route path="/kasir/transaksi" element={<PrivateRoute role="kasir"><TransaksiPenjualan /></PrivateRoute>} />
          <Route path="/pemilik/laporan" element={<PrivateRoute role="pemilik"><LaporanPemilik /></PrivateRoute>} />
          <Route path="/pemilik/laporan-penjualan" element={<PrivateRoute role="pemilik"><LaporanPemilik /></PrivateRoute>} />
          <Route path="/pelanggan/riwayat" element={<PrivateRoute role="pelanggan"><RiwayatBelanja /></PrivateRoute>} />
          <Route path="/pelanggan/profile" element={<PrivateRoute role="pelanggan"><Profile /></PrivateRoute>} />
          <Route path="/pelanggan/status-pembayaran" element={<PrivateRoute role="pelanggan"><StatusPembayaran /></PrivateRoute>} />
          <Route path="/pelanggan/pembayaran" element={<PrivateRoute role="pelanggan"><Pembayaran /></PrivateRoute>} />
          <Route path="/pelanggan/status-pesanan" element={<PrivateRoute role="pelanggan"><StatusPesanan /></PrivateRoute>} />
          <Route path="/pelanggan/detail-pesanan/:id" element={<PrivateRoute role="pelanggan"><DetailPesanan /></PrivateRoute>} />

          
          {/* Redirect setelah login ke halaman utama sesuai role */}
          <Route path="/dashboard" element={<PrivateRoute redirectToRoleDashboard />} />
          
          {/* Owner-only routes */}
          <Route path="/pemilik/dashboard" element={<PrivateRoute role="pemilik"><DashboardKPI /></PrivateRoute>} />
          <Route path="/pemilik/profile" element={<PrivateRoute role="pemilik"><AkunSayaPemilik /></PrivateRoute>} />
          <Route path="/pemilik/riwayat" element={<PrivateRoute role="pemilik"><RiwayatTransaksiPemilik /></PrivateRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><DashboardAdmin /></PrivateRoute>} />
          <Route path="/admin/produk" element={<PrivateRoute role="admin"><ManajemenProduk /></PrivateRoute>} />
          <Route path="/admin/pesanan" element={<PrivateRoute role="admin"><KelolaPesanan /></PrivateRoute>} />
          <Route path="/admin/user" element={<PrivateRoute role="admin"><ManajemenUser /></PrivateRoute>} />
          <Route path="/admin/riwayat" element={<PrivateRoute role="admin"><RiwayatTransaksi /></PrivateRoute>} />
          <Route path="/admin/profile" element={<PrivateRoute role="admin"><AkunSaya /></PrivateRoute>} />
          <Route path="/admin/pesanan/:id" element={<PrivateRoute role="admin"><DetailPesananAdmin /></PrivateRoute>} />
          <Route path="/admin/alamat-pengirim" element={<PrivateRoute role="admin"><PengaturanAlamatPengirim /></PrivateRoute>} />

          
          {/* Kasir routes */}
          <Route path="/kasir/stok" element={<PrivateRoute role="kasir"><ManajemenBarang /></PrivateRoute>} />
          <Route path="/kasir/pesanan" element={<PrivateRoute role="kasir"><KelolaPesananKasir /></PrivateRoute>} />
          <Route path="/kasir/profile" element={<PrivateRoute role="kasir"><AkunSayaKasir /></PrivateRoute>} />
          <Route path="/kasir/riwayat" element={<PrivateRoute role="kasir"><RiwayatTransaksiKasir /></PrivateRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes; 