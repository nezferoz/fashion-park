import React, { useEffect, useState, useRef } from 'react';
import { FaPrint, FaSearch, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { jwtDecode } from '../../utils/jwtDecode';

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user);
    
    if (user?.userId) {
      console.log('Using userId from localStorage:', user.userId);
      return user.userId;
    }
    
    // Fallback: try to get user_id from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log('Decoded JWT token:', decoded);
      return decoded?.user_id;
    }
    
    console.log('No user ID found');
    return null;
  } catch (error) {
    console.error('Error in getUserId:', error);
    return null;
  }
}

const RiwayatTransaksiKasir = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");
      const kasirId = getUserId();
      console.log('Kasir ID:', kasirId);
      if (!kasirId) {
        setError("User tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions/kasir`);
        console.log('Transactions response:', res.data);
        
        // Filter hanya transaksi dengan payment_status SUCCESS
        const successTransactions = res.data.filter(t => t.payment_status === 'SUCCESS');
        setTransactions(successTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError("Gagal mengambil data transaksi");
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const printReceipt = () => {
    const printContent = printRef.current;
    if (printContent) {
      // Buat iframe untuk print
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
      
      // Copy content ke iframe
      iframe.contentDocument.write(`
        <html>
          <head>
            <title>Struk Transaksi</title>
            <style>
              @media print {
                * { color: black !important; background: white !important; }
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: 'Courier New', monospace; 
                  font-size: 9px;
                  line-height: 1.0;
                  width: 200px;
                  margin: 0 auto;
                  page-break-inside: avoid;
                  page-break-after: avoid;
                  page-break-before: avoid;
                }
                .print-thermal { 
                  width: 200px !important; 
                  max-width: 200px !important; 
                  margin: 0 auto;
                  text-align: center;
                  page-break-inside: avoid;
                }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .text-left { text-align: left !important; }
                .flex { display: flex !important; }
                .justify-between { justify-content: space-between !important; }
                .justify-center { justify-content: center !important; }
                .w-18 { width: 72px !important; }
                .w-16 { width: 64px !important; }
                .w-4 { width: 16px !important; }
                .w-14 { width: 56px !important; }
                .mb-1 { margin-bottom: 3px !important; }
                .mb-2 { margin-bottom: 5px !important; }
                .font-bold { font-weight: bold !important; }
                .font-semibold { font-weight: 600 !important; }
                .font-mono { font-weight: 500 !important; }
                .border-t { border-top: 1px solid black !important; }
                .break-words { word-break: break-word !important; }
                .leading-tight { line-height: 1.5 !important; }
                .text-\[8px\] { font-size: 9px !important; }
                .text-\[7px\] { font-size: 8px !important; }
                .text-\[6px\] { font-size: 7px !important; }
                .pr-1 { padding-right: 4px !important; }
                .font-mono { font-family: 'Courier New', monospace !important; }
                .text-gray-600 { color: #4B5563 !important; }
                .flex-1 { flex: 1 !important; }
                .items-start { align-items: flex-start !important; }
                .print-thermal * { page-break-inside: avoid; }
                @page { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                }
                .print-thermal {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .print-thermal * {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .print-thermal div {
                  display: block !important;
                }
                .print-thermal {
                  display: block !important;
                  visibility: visible !important;
                }
              }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 11px; 
                line-height: 1.5;
                text-align: center;
                width: 180px;
                margin: 0 auto;
                padding: 0;
                color: black;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print-thermal { 
                width: 180px; 
                max-width: 180px; 
                margin: 0 auto;
                text-align: center;
                color: black;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                min-height: 400px;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .justify-center { justify-content: center; }
              .w-18 { width: 72px; }
              .w-16 { width: 64px; }
              .w-4 { width: 16px; }
              .w-14 { width: 56px; }
              .mb-1 { margin-bottom: 3px; }
              .mb-2 { margin-bottom: 5px; }
              .font-bold { font-weight: bold; }
              .font-semibold { font-weight: 600; }
              .font-mono { font-weight: 500; }
              .border-t { border-top: 1px solid black; }
              .break-words { word-break: break-word; }
              .leading-tight { line-height: 1.5; }
              .text-\[8px\] { font-size: 9px; }
              .text-\[7px\] { font-size: 8px; }
              .text-\[6px\] { font-size: 7px; }
              .pr-1 { padding-right: 4px; }
              .font-mono { font-family: 'Courier New', monospace; }
              .text-gray-600 { color: #4B5563; }
              .flex-1 { flex: 1; }
              .items-start { align-items: flex-start; }
              @page { 
                margin: 0; 
                padding: 0; 
              }
              .print-thermal {
                margin: 0;
                padding: 0;
              }
              .print-thermal * {
                margin: 0;
                padding: 0;
                color: black;
                background: transparent;
              }
              .print-thermal div {
                display: block;
              }
              .print-thermal {
                display: block;
                visibility: visible;
                color: black;
                background: white;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      iframe.contentDocument.close();
      
      // Print iframe
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Hapus iframe setelah print
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const handlePrintReceipt = async (transaction) => {
    try {
      setLoadingDetails(true);
      setSelectedTransaction(transaction);
      
      // Fetch transaction details
      const detailsRes = await api.get(`/transactions/${transaction.transaction_id}/details`);
      setTransactionDetails(detailsRes.data);
      
      setShowPrintModal(true);
      
      // Hapus auto print - biarkan user klik tombol print manual
      // setTimeout(() => {
      //   window.print();
      // }, 500);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      alert('Gagal mengambil detail transaksi');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closePrintModal = () => {
    setShowPrintModal(false);
    setSelectedTransaction(null);
    setTransactionDetails([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('id-ID');
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 flex-1">
      <div className="bg-white rounded-xl shadow p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Riwayat Transaksi Kasir</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-center text-xs sm:text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Memuat data transaksi...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">ID Transaksi</th>
                    <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden sm:table-cell">Tanggal</th>
                    <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">Pelanggan</th>
                    <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden md:table-cell">Total</th>
                    <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden sm:table-cell">Status</th>
                    <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((trx) => (
                    <tr key={trx.transaction_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="p-2 sm:p-3 lg:p-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                            {trx.transaction_id}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {new Date(trx.transaction_date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 lg:p-4 hidden sm:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {new Date(trx.transaction_date).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 lg:p-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {trx.customer_name || 'Pelanggan Offline'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 lg:p-4 text-center hidden md:table-cell">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          Rp{Number(trx.final_amount || trx.total_amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 lg:p-4 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          trx.payment_status === 'completed' || trx.payment_status === 'Selesai' ? 'bg-green-100 text-green-800' :
                          trx.payment_status === 'pending' || trx.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trx.payment_status || '-'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 lg:p-4 text-center">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => handleViewDetails(trx.transaction_id)}
                            className="bg-blue-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs hover:bg-blue-600 transition-colors"
                            title="Lihat Detail"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(trx)}
                            className="bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs hover:bg-green-600 transition-colors"
                            title="Print Struk"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">Belum ada transaksi</p>
          </div>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Detail Transaksi</h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                    Transaksi ID: {selectedTransaction.transaction_id}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {transactionDetails.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-gray-500">
                              {item.size && `Ukuran: ${item.size}`} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 ml-2 sm:ml-4">
                            Rp{Number(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Print Struk</h3>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Apakah Anda yakin ingin mencetak struk untuk transaksi ini?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-xs sm:text-sm">
                  <p><strong>ID:</strong> {selectedTransaction?.transaction_id}</p>
                  <p><strong>Pelanggan:</strong> {selectedTransaction?.customer_name || 'Pelanggan Offline'}</p>
                  <p><strong>Total:</strong> Rp{Number(selectedTransaction?.final_amount || selectedTransaction?.total_amount).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={printReceipt}
                  className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Print Struk
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="flex-1 bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Print Content */}
        <div style={{ display: 'none' }}>
          <div ref={printRef} className="print-thermal">
            {/* Print content will be populated here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatTransaksiKasir; 