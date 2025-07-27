import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const DashboardKasir = () => {
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/transactions/today");
        setTotalTransaksi(res.data.length);
        setTotalPenjualan(res.data.reduce((sum, trx) => sum + Number(trx.total_amount), 0));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard Kasir</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-8 items-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Transaksi Hari Ini: {totalTransaksi}
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Penjualan Hari Ini: Rp{totalPenjualan.toLocaleString()}
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <Link to="/kasir/transaksi" className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Transaksi Penjualan</Link>
              <Link to="/kasir/riwayat" className="bg-gray-200 text-gray-700 px-6 py-3 rounded font-semibold hover:bg-gray-300 transition">Riwayat Transaksi</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardKasir; 