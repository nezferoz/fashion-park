import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCartCount } from "../utils/cart";
import api from "../utils/api";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const role = user?.role;
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  // Update badge jika route berubah (misal: setelah tambah ke keranjang)
  useEffect(() => {
    if (isLoggedIn()) {
      getCartCount().then(setCartCount).catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [location]);

  // Fetch notif count saat mount dan interval
  useEffect(() => {
    let interval;
    async function fetchNotifCount() {
      if (isLoggedIn() && user?.role === 'pelanggan') {
        try {
          const res = await api.get(`/notifications?user_id=${user.user_id}`);
          setNotifCount(res.data.filter(n => !n.is_read).length);
        } catch {
          setNotifCount(0);
        }
      } else {
        setNotifCount(0);
      }
    }
    fetchNotifCount();
    interval = setInterval(fetchNotifCount, 10000); // update tiap 10 detik
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Menu pelanggan
  let menu = [<Link key="home" to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>];
  if (role === "pelanggan") {
    menu = [
      <Link key="home" to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>,
      <Link key="katalog" to="/katalog" className="text-gray-700 hover:text-blue-600 font-medium">Katalog</Link>,
      <Link key="cart" to="/cart" className="text-2xl relative" title="Keranjang">
        <span role="img" aria-label="Keranjang">🛒</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {cartCount}
          </span>
        )}
      </Link>,
      <Link key="notifikasi" to="/pelanggan/profile" className="text-2xl relative" title="Notifikasi">
        <span role="img" aria-label="Notifikasi">🔔</span>
        {notifCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-bounce">
            {notifCount}
          </span>
        )}
      </Link>,
      <Link key="riwayat" to="/pelanggan/profile" className="text-2xl" title="Riwayat & Profil"><span role="img" aria-label="Profile">👤</span></Link>
    ];
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo kiri */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl font-bold text-blue-600 tracking-tight">Fashion Park</span>
        </div>
        {/* Menu tengah khusus pelanggan */}
        {role === "pelanggan" ? (
          <div className="hidden md:flex gap-8 items-center mx-auto">
            {menu}
          </div>
        ) : (
          <div className="hidden md:flex gap-8 items-center">{menu}</div>
        )}
        {/* Aksi kanan */}
        <div className="flex items-center gap-4">
          {user && role !== "pelanggan" ? (
            <>
              <span className="text-gray-700 font-medium">{user.name} ({user.role})</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : !user ? (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Login</Link>
          ) : null}
        </div>
        {/* Hamburger menu mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-4 py-4 flex flex-col gap-4">
          {menu}
          {!user ? (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Login</Link>
          ) : null}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 