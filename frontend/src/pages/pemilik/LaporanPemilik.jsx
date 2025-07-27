import React, { useEffect, useState } from "react";
import api from "../../utils/api";
// import { Bar } from "react-chartjs-2"; // Uncomment jika chartjs sudah diinstall

const LaporanPemilik = () => {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState([]);

  useEffect(() => {
    const fetchLaporan = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/reports/sales");
        setLaporan(res.data);
        setTotalOmzet(res.data.reduce((sum, row) => sum + Number(row.total_amount), 0));
      } catch {
        setError("Gagal mengambil data laporan");
      }
      setLoading(false);
    };
    const fetchProdukTerlaris = async () => {
      try {
        const res = await api.get("/reports/best-sellers");
        setProdukTerlaris(res.data);
      } catch {}
    };
    fetchLaporan();
    fetchProdukTerlaris();
  }, []);

  // Contoh data chart (dummy, ganti dengan data asli jika chartjs diaktifkan)
  // const chartData = {
  //   labels: produkTerlaris.map((p) => p.product_name),
  //   datasets: [
  //     {
  //       label: "Jumlah Terjual",
  //       data: produkTerlaris.map((p) => p.total_sold),
  //       backgroundColor: "#38bdf8",
  //     },
  //   ],
  // };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Laporan Penjualan & Analisis (Pemilik)</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-8 items-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Omzet: Rp{totalOmzet.toLocaleString()}
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Transaksi: {laporan.length}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 mt-8">Produk Terlaris</h3>
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
            {/* <Bar data={chartData} /> */}
            <h3 className="text-lg font-semibold mb-2 mt-8">Riwayat Penjualan</h3>
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
                {laporan.map((row) => (
                  <tr key={row.id || row.transaction_id}>
                    <td>{row.transaction_date?.slice(0, 10)}</td>
                    <td className="text-right">Rp{Number(row.total_amount).toLocaleString()}</td>
                    <td className="text-center">{row.kasir_name || row.kasir || '-'}</td>
                    <td className="text-center">{row.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default LaporanPemilik; 