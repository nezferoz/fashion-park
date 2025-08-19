import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCartCount } from "../utils/cart";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);




  // Update badge jika route berubah (misal: setelah tambah ke keranjang)
  useEffect(() => {
    if (user) {
      getCartCount().then(setCartCount).catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [location, user]);







  // Menu untuk semua user (home dan katalog)
  const baseMenu = [
    <Link key="home" to="/" className="text-2xl" title="Beranda"><span role="img" aria-label="Home">🏠</span></Link>,
    <Link key="katalog" to="/katalog" className="text-2xl" title="Katalog Produk"><span role="img" aria-label="Catalog">🛍️</span></Link>
  ];

  // Menu tambahan untuk user yang sudah login
  const userMenu = user ? [
    <Link key="cart" to="/cart" className="text-2xl relative" title="Keranjang Belanja">
      <span role="img" aria-label="Cart">🛒</span>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-bounce">
          {cartCount}
        </span>
      )}
    </Link>,
    <Link key="profile" to="/pelanggan/profile" className="text-2xl" title="Profil"><span role="img" aria-label="Profile">👤</span></Link>
  ] : [];

  // Gabungkan menu
  const allMenu = [...baseMenu, ...userMenu];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Logo kiri */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">Fashion Park</span>
        </div>
        
        {/* Menu tengah */}
        <div className="hidden md:flex gap-6 items-center">
          {allMenu}
        </div>
        
        {/* Aksi kanan */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User info disembunyikan */}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Register
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {allMenu}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 