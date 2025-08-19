import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const DashboardPemilik = () => {
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const laporan = await api.get("/reports/sales");
        setTotalOmzet(laporan.data.reduce((sum, row) => sum + Number(row.total_amount), 0));
        setTotalTransaksi(laporan.data.length);
        const best = await api.get("/reports/best-sellers");
        setProdukTerlaris(best.data.slice(0, 3));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard Pemilik</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-8 items-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Omzet: Rp{Number(totalOmzet).toLocaleString('id-ID')}
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Transaksi: {totalTransaksi}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 mt-8">Top 3 Produk Terlaris</h3>
            <table className="w-full mb-6">
              <thead>
                <tr>
                  <th className="text-left">Produk</th>
                  <th className="text-right">Jumlah Terjual</th>
                </tr>
              </thead>
              <tbody>
                {produkTerlaris.map((p) => (
                  <tr key={p.product_id}>
                    <td>{p.product_name}</td>
                    <td className="text-right">{p.total_sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8">
              <Link to="/pemilik/laporan" className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Lihat Laporan Lengkap</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPemilik; 