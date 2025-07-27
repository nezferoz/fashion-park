import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const RiwayatTransaksi = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/transactions");
        setRiwayat(res.data);
      } catch {
        setError("Gagal mengambil data riwayat transaksi");
      }
      setLoading(false);
    };
    fetchRiwayat();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Riwayat Transaksi</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <table className="w-full mb-6">
            <thead>
              <tr>
                <th>Kode Transaksi</th>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r) => (
                <tr key={r.transaction_id}>
                  <td>{r.transaction_code}</td>
                  <td>{r.customer_name}</td>
                  <td>{r.transaction_date?.slice(0, 10)}</td>
                  <td>Rp{Number(r.total_amount).toLocaleString()}</td>
                  <td><button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setSelectedTransaksi(r)}>Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal Detail Transaksi */}
        {selectedTransaksi && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setSelectedTransaksi(null)}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Detail Transaksi</h3>
              <div className="mb-2"><b>Kode Transaksi:</b> {selectedTransaksi.transaction_code}</div>
              <div className="mb-2"><b>Pelanggan:</b> {selectedTransaksi.customer_name}</div>
              <div className="mb-2"><b>Status:</b> {selectedTransaksi.payment_status}</div>
              <div className="mb-2"><b>Total:</b> Rp{Number(selectedTransaksi.total_amount).toLocaleString()}</div>
              <div className="mb-2"><b>Catatan:</b> {selectedTransaksi.notes || '-'}</div>
              <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition" onClick={() => setSelectedTransaksi(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksi; 