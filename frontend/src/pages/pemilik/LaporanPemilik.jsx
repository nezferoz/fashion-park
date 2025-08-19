import React, { useEffect, useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import api from "../../utils/api";
// import { Bar } from "react-chartjs-2"; // Uncomment jika chartjs sudah diinstall

const LaporanPemilik = () => {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState([]);

  const exportToExcel = () => {
    // Create CSV content for sales report
    const headers = ['Tanggal', 'Total (Rp)', 'Kasir', 'Status'];
    const csvContent = [
      headers.join(','),
      ...laporan.map(row => {
        const date = new Date(row.transaction_date);
        const formattedDate = date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        return [
          `"${formattedDate}"`,
          `"${Number(row.total_amount).toLocaleString('id-ID')}"`,
          `"${row.kasir_name || 'N/A'}"`,
          `"${row.status || 'Pending'}"`
        ].join(',');
      })
    ].join('\n');

    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Laporan Penjualan & Analisis (Pemilik)</h2>
          <button 
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <FaFileExcel />
            Export ke Excel
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-8 items-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Omzet: Rp{Number(totalOmzet).toLocaleString('id-ID')}
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg px-6 py-4 font-bold text-xl shadow">
                Total Transaksi: {laporan.length}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 mt-8">Produk Terlaris</h3>
            <div className="overflow-x-auto">
              <table className="w-full mb-6 border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Produk</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Jumlah Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {produkTerlaris.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                        Belum ada data produk terlaris
                      </td>
                    </tr>
                  ) : (
                    produkTerlaris.map((p, index) => (
                      <tr key={p.product_id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{p.product_name}</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {p.total_sold.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* <Bar data={chartData} /> */}
            <h3 className="text-lg font-semibold mb-2 mt-8">Riwayat Penjualan</h3>
            <div className="overflow-x-auto">
              <table className="w-full mb-6 border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Kasir</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                        Belum ada data penjualan
                      </td>
                    </tr>
                  ) : (
                    laporan.map((row, index) => {
                      const date = new Date(row.transaction_date);
                      const formattedDate = date.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <tr key={row.id || row.transaction_id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{formattedDate}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            Rp{Number(row.total_amount).toLocaleString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 text-center">
                            {row.kasir_name || row.kasir || '-'}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              row.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                              row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LaporanPemilik; 