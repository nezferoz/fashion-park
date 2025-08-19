import React from "react";
import { FaBarcode, FaCashRegister, FaChartBar, FaClipboardList, FaCog, FaHistory, FaTachometerAlt, FaUser, FaUsersCog } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const menuByRole = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/pesanan", label: "Kelola Pesanan", icon: <FaClipboardList /> },
    { to: "/admin/user", label: "Manajemen User", icon: <FaUsersCog /> },
    { to: "/admin/riwayat", label: "Riwayat Transaksi", icon: <FaHistory /> },
    { to: "/admin/profile", label: "Akun", icon: <FaUser /> },
  ],
  pemilik: [
    { to: "/pemilik/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/pemilik/laporan-penjualan", label: "Laporan Penjualan", icon: <FaChartBar /> },
    { to: "/pemilik/riwayat", label: "Riwayat Transaksi", icon: <FaHistory /> },
    { to: "/pemilik/profile", label: "Akun", icon: <FaUser /> },
  ],
  kasir: [
    { to: "/kasir/transaksi", label: "POS / Checkout", icon: <FaCashRegister /> },
    { to: "/kasir/stok", label: "Manajemen Barang & Stok", icon: <FaBarcode /> },
    { to: "/kasir/riwayat", label: "Riwayat Transaksi", icon: <FaHistory /> },
    { to: "/kasir/profile", label: "Akun", icon: <FaUser /> },
  ],
  pelanggan: [
    { to: "/pelanggan/profile", label: "Akun", icon: <FaUser /> },
    { to: "/pelanggan/status-pesanan", label: "Pesanan Saya", icon: <FaClipboardList /> },
    { to: "/pelanggan/riwayat", label: "Riwayat Belanja", icon: <FaHistory /> },
  ],
};

const shadowMenu = [
  "/admin/dashboard",
  "/admin/pesanan",
  "/admin/user",
  "/admin/riwayat",
  "/admin/profile",
  "/pemilik/dashboard",
  "/pemilik/riwayat",
  "/pemilik/profile",
  "/kasir/transaksi",
  "/kasir/stok",
  "/kasir/riwayat",
  "/kasir/profile",
  "/pelanggan/profile",
  "/pelanggan/status-pesanan",
  "/pelanggan/riwayat"
];

const customShadow = '0 4px 24px 0 rgba(30,64,175,0.18), 0 1.5px 6px 0 rgba(30,64,175,0.12)';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  let role = user?.role?.toLowerCase();
  // Mapping owner ke pemilik agar menu sidebar sama
  if (role === 'owner') role = 'pemilik';
  if (!role || !menuByRole[role]) return null;

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-blue-600 text-white flex flex-col shadow-lg z-40">
      <div className="flex items-center h-16 px-6 font-bold text-2xl tracking-tight border-b border-blue-700 mb-2">
        <span>Fashion Park</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {menuByRole[role].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={location.pathname.startsWith(item.to) && shadowMenu.includes(item.to) ? { boxShadow: customShadow } : {}}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 hover:bg-blue-700 hover:text-white ${location.pathname.startsWith(item.to)
              ? "bg-white text-blue-600 border-l-4 border-blue-700 font-bold rounded-xl"
              : ""}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-blue-700">
        <span className="block text-sm font-semibold">{user?.name} ({role})</span>
      </div>
    </aside>
  );
};

export default Sidebar; 