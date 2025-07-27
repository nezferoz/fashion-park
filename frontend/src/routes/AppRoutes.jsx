import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Katalog from "../pages/Katalog";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PrivateRoute from "../components/PrivateRoute";
import ManajemenProduk from "../pages/admin/ManajemenProduk";
import TransaksiPenjualan from "../pages/kasir/TransaksiPenjualan";
import LaporanPemilik from "../pages/pemilik/LaporanPemilik";
import RiwayatBelanja from "../pages/pelanggan/RiwayatBelanja";
import Profile from "../pages/pelanggan/Profile";
import KeranjangBelanja from "../pages/pelanggan/KeranjangBelanja";
import StatusPembayaran from "../pages/pelanggan/StatusPembayaran";
import Pembayaran from "../pages/pelanggan/Pembayaran";
import DashboardAdmin from "../pages/DashboardAdmin";
import ManajemenUser from "../pages/admin/ManajemenUser";
import LaporanPenjualan from "../pages/admin/LaporanPenjualan";
import Sidebar from "../components/Sidebar";
import KelolaPesanan from "../pages/admin/KelolaPesanan";
import RiwayatTransaksi from "../pages/admin/RiwayatTransaksi";
import AkunSaya from "../pages/admin/AkunSaya";
import KelolaPesananKasir from "../pages/kasir/KelolaPesananKasir";
import AkunSayaKasir from "../pages/kasir/AkunSayaKasir";
import RiwayatTransaksiKasir from "../pages/kasir/RiwayatTransaksiKasir";
import DashboardKPI from "../pages/pemilik/DashboardKPI";
import KelolaPesananPemilik from "../pages/pemilik/KelolaPesananPemilik";
import LaporanKeuangan from "../pages/pemilik/LaporanKeuangan";
import PengaturanSistem from "../pages/pemilik/PengaturanSistem";
import AkunSayaPemilik from "../pages/pemilik/AkunSayaPemilik";
import RiwayatTransaksiPemilik from "../pages/pemilik/RiwayatTransaksiPemilik";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const AppRoutes = () => {
  const user = getUser();
  const role = user?.role;
  const showSidebar = ["admin", "pemilik", "kasir"].includes(role);
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
          
          {/* Rute yang dilindungi */}
          <Route path="/cart" element={<PrivateRoute role="pelanggan"><KeranjangBelanja /></PrivateRoute>} />
          <Route path="/admin/produk" element={<PrivateRoute role="admin"><ManajemenProduk /></PrivateRoute>} />
          <Route path="/kasir/transaksi" element={<PrivateRoute role="kasir"><TransaksiPenjualan /></PrivateRoute>} />
          <Route path="/pemilik/laporan" element={<PrivateRoute role="pemilik"><LaporanPemilik /></PrivateRoute>} />
          <Route path="/pelanggan/riwayat" element={<PrivateRoute role="pelanggan"><RiwayatBelanja /></PrivateRoute>} />
          <Route path="/pelanggan/profile" element={<PrivateRoute role="pelanggan"><Profile /></PrivateRoute>} />
          <Route path="/pelanggan/status-pembayaran" element={<PrivateRoute role="pelanggan"><StatusPembayaran /></PrivateRoute>} />
          <Route path="/pelanggan/pembayaran" element={<PrivateRoute role="pelanggan"><Pembayaran /></PrivateRoute>} />
          
          {/* Redirect setelah login ke halaman utama sesuai role */}
          <Route path="/dashboard" element={<PrivateRoute redirectToRoleDashboard />} />
          
          {/* Owner-only routes */}
          <Route path="/pemilik/dashboard" element={<PrivateRoute role="pemilik"><DashboardKPI /></PrivateRoute>} />
          <Route path="/pemilik/pesanan" element={<PrivateRoute role="pemilik"><KelolaPesananPemilik /></PrivateRoute>} />
          <Route path="/pemilik/keuangan" element={<PrivateRoute role="pemilik"><LaporanKeuangan /></PrivateRoute>} />
          <Route path="/pemilik/pengaturan" element={<PrivateRoute role="pemilik"><PengaturanSistem /></PrivateRoute>} />
          <Route path="/pemilik/profile" element={<PrivateRoute role="pemilik"><AkunSayaPemilik /></PrivateRoute>} />
          <Route path="/pemilik/riwayat" element={<PrivateRoute role="pemilik"><RiwayatTransaksiPemilik /></PrivateRoute>} />
          <Route path="/admin/user" element={<PrivateRoute role="pemilik"><ManajemenUser /></PrivateRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><DashboardAdmin /></PrivateRoute>} />
          <Route path="/admin/produk" element={<PrivateRoute role="admin"><ManajemenProduk /></PrivateRoute>} />
          <Route path="/admin/laporan" element={<PrivateRoute role="admin"><LaporanPenjualan /></PrivateRoute>} />
          <Route path="/admin/pesanan" element={<PrivateRoute role="admin"><KelolaPesanan /></PrivateRoute>} />
          <Route path="/admin/riwayat" element={<PrivateRoute role="admin"><RiwayatTransaksi /></PrivateRoute>} />
          <Route path="/admin/profile" element={<PrivateRoute role="admin"><AkunSaya /></PrivateRoute>} />
          
          {/* Kasir routes */}
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