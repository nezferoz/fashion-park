import React from "react";
import { Link } from "react-router-dom";

const DashboardPelanggan = () => (
  <div className="container mx-auto px-4 py-12 flex-1">
    <div className="bg-white rounded-xl shadow p-8">
      <h2 className="text-3xl font-bold mb-6">Dashboard Pelanggan</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/katalog" className="text-blue-600 hover:underline">Lihat Katalog</Link></li>
        <li><Link to="/pelanggan/riwayat" className="text-blue-600 hover:underline">Riwayat Belanja</Link></li>
        <li><Link to="/pelanggan/profile" className="text-blue-600 hover:underline">Profile</Link></li>
      </ul>
    </div>
  </div>
);

export default DashboardPelanggan; 