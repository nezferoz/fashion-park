import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.user_id;
  } catch {
    return null;
  }
}

const KelolaPesananKasir = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPesanan = async () => {
      setLoading(true);
      setError("");
      const kasirId = getUserId();
      if (!kasirId) {
        setError("User tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions?kasir_id=${kasirId}`);
        setPesanan(res.data);
      } catch {
        setError("Gagal mengambil data pesanan");
      }
      setLoading(false);
    };
    fetchPesanan();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Kelola Pesanan (Kasir)</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <table className="w-full mb-6">
            <thead>
              <tr><th>Kode Pesanan</th><th>Pelanggan</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pesanan.map((p) => (
                <tr key={p.transaction_id}>
                  <td>{p.transaction_code}</td>
                  <td>{p.customer_name}</td>
                  <td>{p.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KelolaPesananKasir; 