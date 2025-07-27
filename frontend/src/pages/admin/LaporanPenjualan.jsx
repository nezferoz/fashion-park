import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const LaporanPenjualan = () => {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLaporan = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/reports?type=sales");
        setLaporan(res.data || []);
      } catch {
        setError("Gagal mengambil data laporan");
      }
      setLoading(false);
    };
    fetchLaporan();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Laporan Penjualan</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}
          <div className="text-xs text-gray-500 mt-1">Pastikan server backend berjalan dan Anda memiliki akses yang benar.</div>
        </div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <table className="w-full mb-6">
            <thead>
              <tr>
                <th className="text-left">Tanggal</th>
                <th className="text-right">Total</th>
                <th className="text-center">Kasir</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {laporan.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{item.tanggal || item.report_date?.slice(0, 10) || item.transaction_date?.slice(0, 10) || '-'}</td>
                  <td className="text-right">Rp{(item.total || item.total_sales || item.total_amount || 0).toLocaleString()}</td>
                  <td className="text-center">{item.user_name || item.kasir_name || item.kasir || '-'}</td>
                  <td className="text-center">{item.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LaporanPenjualan; 