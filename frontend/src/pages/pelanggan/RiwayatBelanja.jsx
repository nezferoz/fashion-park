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

const RiwayatBelanja = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      setError("");
      const userId = getUserId();
      if (!userId) {
        setError("User tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions?user_id=${userId}`);
        setRiwayat(res.data);
      } catch {
        setError("Gagal mengambil riwayat belanja");
      }
      setLoading(false);
    };
    fetchRiwayat();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Riwayat Belanja</h2>
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
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((trx) => (
                <tr key={trx.transaction_id}>
                  <td>{trx.transaction_date?.slice(0, 10)}</td>
                  <td className="text-right">Rp{Number(trx.total_amount).toLocaleString()}</td>
                  <td className="text-center">{trx.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RiwayatBelanja; 