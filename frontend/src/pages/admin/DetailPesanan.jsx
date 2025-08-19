import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const DetailPesanan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/transactions/${id}`);
        setData(res.data);
      } catch (err) {
        setError("Gagal mengambil detail pesanan");
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Fungsi untuk generate label pelanggan offline
  const getCustomerLabel = (customerName) => {
    if (customerName) {
      return customerName;
    }
    return "pelanggankasir1"; // Default untuk detail, atau bisa dihitung berdasarkan data lain
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Data tidak ditemukan</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Detail Pesanan</h2>
      <div className="mb-2"><b>Kode Pesanan:</b> {data.transaction_code || '-'}</div>
      <div className="mb-2">
        <b>Pelanggan:</b> 
        <span className={!data.customer_name ? 'text-blue-600 font-medium ml-1' : 'ml-1'}>
          {getCustomerLabel(data.customer_name)}
        </span>
      </div>
      <div className="mb-2"><b>Kasir:</b> {data.cashier_name || '-'}</div>
      <div className="mb-2"><b>Status:</b> <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.payment_status === 'paid' ? 'bg-green-100 text-green-800' : data.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{data.payment_status || '-'}</span></div>
      <div className="mb-2"><b>Total:</b> {data.final_amount ? `Rp${Number(data.final_amount).toLocaleString()}` : '-'}</div>
      <div className="mb-2"><b>Tanggal:</b> {data.transaction_date ? data.transaction_date.slice(0,10) : '-'}</div>
      <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => navigate(-1)}>Kembali</button>
    </div>
  );
};

export default DetailPesanan; 