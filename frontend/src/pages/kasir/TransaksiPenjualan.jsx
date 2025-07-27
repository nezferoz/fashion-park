import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaShoppingCart, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import api from '../../utils/api';
import QRCode from 'qrcode.react';

const TransaksiPenjualan = () => {
  const searchInputRef = useRef(null);
  // Tambahan: input untuk barcode scanner
  const barcodeInputRef = useRef();
  const [barcodeInput, setBarcodeInput] = useState('');
  // State produk dari backend
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Tambahkan kembali state untuk hasil pencarian
  const [searchResult, setSearchResult] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalSemua, setTotalSemua] = useState(0);
  const [bayar, setBayar] = useState('');
  const [kembali, setKembali] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrString, setQrString] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [lastOrderId, setLastOrderId] = useState("");
  const receiptRef = useRef();
  // Tambahkan state untuk VA
  const [vaInfo, setVaInfo] = useState(null);
  const [showVAModal, setShowVAModal] = useState(false);
  const [snapUrl, setSnapUrl] = useState(null);
  const [showSnapModal, setShowSnapModal] = useState(false);
  // Ambil nama kasir dari localStorage
  const kasirName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.name || '-';
    } catch {
      return '-';
    }
  })();
  // Hapus state selectedSizes, tidak perlu lagi

  // Fetch produk dari backend saat mount
  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  // Update filteredProducts setiap searchTerm berubah
  useEffect(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      setSearchResult(products);
      return;
    }
    // Filter produk berdasarkan nama/barcode (case-insensitive, barcode boleh kosong)
    const filtered = products.filter(p =>
      (p.product_name && p.product_name.toLowerCase().includes(keyword)) ||
      (p.barcode && p.barcode.toLowerCase().includes(keyword))
    );
    setSearchResult(filtered);
  }, [searchTerm, products]);

  // Tambah produk ke keranjang (default size pertama jika ada)
  const addToCart = (product) => {
    if (product) {
      let size = '-';
      if (product.variants && product.variants.length > 0) {
        size = product.variants[0].size;
      } else if (product.size) {
        size = product.size;
      }
      const existingProduct = cart.find(item => item.product_id === product.product_id && item.size === size);
      if (existingProduct) {
        // Update jumlah jika sudah ada
        const updatedCart = cart.map(item =>
          item.product_id === product.product_id && item.size === size
            ? { ...item, qty: item.qty + 1, total: Number(item.price) * (item.qty + 1) }
            : item
        );
        setCart(updatedCart);
      } else {
        const newItem = {
          product_id: product.product_id,
          product_name: product.product_name,
          brand: product.brand || '-',
          price: Number(product.price),
          qty: 1,
          total: Number(product.price),
          main_image_id: product.main_image_id,
          size: size,
          variants: product.variants || [],
        };
        setCart([...cart, newItem]);
      }
    }
  };

  const handleResetCart = () => {
    setCart([]);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!');
      return;
    }
    const order_id = `KSR-${Date.now()}`;
    setLastOrderId(order_id);
    if (paymentMethod === 'qris') {
      // Proses QRIS tanpa validasi input bayar
      try {
        const gross_amount = totalSemua;
        const res = await api.post('/payment/qris', { order_id, gross_amount });
        if (res.data && res.data.qr_string) {
          setQrString(res.data.qr_string);
          setShowQRModal(true);
          // Simpan transaksi untuk struk, tapi struk baru muncul setelah QR modal ditutup
          setLastTransaction({
            waktu: currentTime,
            cart: [...cart],
            total: totalSemua,
            bayar: gross_amount,
            kembali: 0,
            metode: paymentMethod,
            order_id,
            kasir: kasirName,
          });
        } else {
          alert('Gagal mendapatkan QR dari Midtrans');
        }
      } catch (err) {
        alert('Gagal generate QRIS: ' + (err.response?.data?.message || err.message));
      }
      return;
    }
    if (paymentMethod === 'transfer') {
      // Integrasi Snap Midtrans
      try {
        const gross_amount = totalSemua;
        const res = await api.post('/payment/midtrans', {
          order_id,
          gross_amount,
          customer: { name: kasirName },
        });
        if (res.data && res.data.redirect_url) {
          setSnapUrl(res.data.redirect_url);
          setShowSnapModal(true);
        } else {
          alert('Gagal mendapatkan link pembayaran Snap dari Midtrans');
        }
      } catch (err) {
        alert('Gagal membuat transaksi Snap: ' + (err.response?.data?.message || err.message));
      }
      return;
    }
    // Untuk cash/transfer, validasi input bayar seperti biasa
    const bayarAmount = parseFloat(bayar.replace(/\./g, ''));
    if (!isNaN(bayarAmount) && bayarAmount >= totalSemua) {
      setKembali(bayarAmount - totalSemua);
      // Simpan transaksi terakhir untuk struk
      setLastTransaction({
        waktu: currentTime,
        cart: [...cart],
        total: totalSemua,
        bayar: bayarAmount,
        kembali: bayarAmount - totalSemua,
        metode: paymentMethod,
        order_id,
        kasir: kasirName,
      });
      setShowReceipt(true);
    } else {
      alert('Jumlah bayar tidak cukup!');
    }
  };

  const handlePrintReceipt = () => {
    if (!showReceipt || !lastTransaction) {
      alert('Lakukan pembayaran terlebih dahulu!');
      return;
    }
    window.print();
    // Reset keranjang dan input setelah print
    setCart([]);
    setBayar("");
    setKembali("");
    setShowReceipt(false);
    setLastTransaction(null);
    setLastOrderId("");
  };

  const handleCloseReceipt = () => {
    // Reset keranjang dan input setelah tutup struk
    setCart([]);
    setBayar("");
    setKembali("");
    setShowReceipt(false);
    setLastTransaction(null);
    setLastOrderId("");
  };

  const handleEditItem = (itemIdx) => {
    // TODO: Implementasi edit qty item (bisa buka modal atau inline edit)
    alert('Edit item (dummy handler)');
  };

  const handleDeleteItem = (itemIdx) => {
    const newCart = cart.filter((_, idx) => idx !== itemIdx);
    setCart(newCart);
  };

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + item.total, 0);
    setTotalSemua(newTotal);
  }, [cart]);

  useEffect(() => {
    if (bayar) {
      const bayarAmount = parseFloat(bayar);
      if (!isNaN(bayarAmount) && bayarAmount >= totalSemua) {
        setKembali(bayarAmount - totalSemua);
      } else {
        setKembali('');
      }
    } else {
      setKembali('');
    }
  }, [bayar, totalSemua]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Tambahkan fungsi handleSearch untuk filter produk saat tombol 'Cari' diklik
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      setSearchResult([]);
      return;
    }
    const filtered = products.filter(p =>
      (p.product_name && p.product_name.toLowerCase().includes(keyword)) ||
      (p.barcode && p.barcode.toLowerCase().includes(keyword))
    );
    setSearchResult(filtered);
  };

  // Tambahkan useEffect untuk reset hasil pencarian jika kolom pencarian dihapus
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResult([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tambahkan input barcode scanner (selalu fokus)
  useEffect(() => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);
  // Fokus ulang jika user klik di luar
  useEffect(() => {
    const handleFocus = () => {
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    };
    window.addEventListener('click', handleFocus);
    return () => window.removeEventListener('click', handleFocus);
  }, []);
  // Handler ketika barcode scanner input (Enter)
  const handleBarcodeEnter = (e) => {
    if (e.key === 'Enter') {
      const id = barcodeInput.trim();
      // Cari produk berdasarkan ID
      const found = products.find(p => String(p.product_id) === id);
      if (found) {
        addToCart(found);
      } else {
        alert('Produk tidak ditemukan');
      }
      setBarcodeInput('');
    }
  };

  // Handler untuk ubah size di keranjang
  const handleChangeSize = (index, newSize) => {
    setCart(prevCart => {
      const item = prevCart[index];
      // Cek apakah sudah ada item dengan product_id + newSize
      const existingIdx = prevCart.findIndex((it, idx) => idx !== index && it.product_id === item.product_id && it.size === newSize);
      if (existingIdx !== -1) {
        // Gabungkan qty
        const updatedCart = prevCart.filter((_, idx) => idx !== index);
        updatedCart[existingIdx > index ? existingIdx - 1 : existingIdx] = {
          ...prevCart[existingIdx],
          qty: prevCart[existingIdx].qty + item.qty,
          total: prevCart[existingIdx].price * (prevCart[existingIdx].qty + item.qty),
        };
        return updatedCart;
      } else {
        // Update size item
        return prevCart.map((it, idx) =>
          idx === index ? { ...it, size: newSize } : it
        );
      }
    });
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Keranjang Penjualan</h1>
      {/* Input barcode scanner hidden, selalu fokus */}
      <input
        ref={barcodeInputRef}
        type="text"
        value={barcodeInput}
        onChange={e => setBarcodeInput(e.target.value)}
        onKeyDown={handleBarcodeEnter}
        style={{ position: 'absolute', left: '-9999px' }}
        tabIndex={-1}
        autoFocus
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-6">
          {/* Card Cari Barang */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-600">
              <FaSearch className="mr-3" /> Cari Barang
            </h2>
            <form className="flex space-x-2" onSubmit={handleSearch}>
              <input
                ref={searchInputRef}
                type="text"
                name="barcode"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Scan atau ketik kode barang..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold">
                Cari
              </button>
            </form>
          </div>

          {/* Card Hasil Pencarian */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Hasil Pencarian</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Gambar</th>
                    <th className="py-2">ID Barang</th>
                    <th className="py-2">Nama Barang</th>
                    <th className="py-2">Ukuran</th>
                    <th className="py-2">Harga Jual</th>
                    <th className="py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.length > 0 ? (
                    searchResult.map(product => (
                      <tr key={product.product_id}>
                        <td className="py-2">
                          {product.main_image_id ? (
                            <img src={`/api/products/images/${product.main_image_id}`} alt={product.product_name} className="w-16 h-16 object-cover rounded" />
                          ) : (
                            <span className="text-gray-400">(no image)</span>
                          )}
                        </td>
                        <td className="py-2">{product.product_id}</td>
                        <td className="py-2">{product.product_name}</td>
                        <td className="py-2">
                          {/* Tampilkan size default saja, tanpa dropdown */}
                          {product.variants && product.variants.length > 0 ? (
                            product.variants[0].size
                          ) : (
                            product.size || '-'
                          )}
                        </td>
                        <td className="py-2">Rp{Number(product.price).toLocaleString()}</td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => {
                              const size = product.variants && product.variants.length > 0 ? product.variants[0].size : product.size || '-';
                              addToCart({ ...product, size });
                            }}
                            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
                            disabled={product.variants && product.variants.length > 0 && !product.variants[0].size}
                          >
                            <FaPlus />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : searchTerm.trim() !== '' ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        Tidak ada barang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        Silakan cari barang...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan - KASIR */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center text-blue-600">
              <FaShoppingCart className="mr-3" /> KASIR
            </h2>
            <button onClick={handleResetCart} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold">
              RESET KERANJANG
            </button>
          </div>
          <p className="mb-4 text-gray-600">Tanggal: {currentTime.toLocaleString('id-ID')}</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-2">No</th>
                  <th className="py-2 px-2">Gambar</th>
                  <th className="py-2 px-2">Nama Barang</th>
                  <th className="py-2 px-2">Ukuran</th>
                  <th className="py-2 px-2">Jumlah</th>
                  <th className="py-2 px-2">Total</th>
                  <th className="py-2 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item.product_id}>
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">
                      {item.main_image_id ? (
                        <img src={`/api/products/images/${item.main_image_id}`} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">(no image)</span>
                      )}
                    </td>
                    <td className="py-3 px-2">{item.product_name}</td>
                    <td className="py-3 px-2">
                      {/* Dropdown size di keranjang */}
                      {item.variants && item.variants.length > 0 ? (
                        <select
                          value={item.size}
                          onChange={e => handleChangeSize(index, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          {item.variants.map(variant => (
                            <option key={variant.variant_id} value={variant.size}>{variant.size}</option>
                          ))}
                        </select>
                      ) : (
                        item.size || '-'
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <input type="number" value={item.qty} className="w-16 p-1 border rounded" readOnly />
                    </td>
                    <td className="py-3 px-2">Rp{Number(item.total).toLocaleString()}</td>
                    <td className="py-3 px-2 flex items-center space-x-2">
                      <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditItem(index)}><FaEdit /></button>
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteItem(index)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Semua</span>
              <span>Rp{Number(totalSemua).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                /> Cash
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={() => setPaymentMethod("qris")}
                /> QRIS
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={() => setPaymentMethod("transfer")}
                /> Transfer
              </label>
            </div>
            {paymentMethod !== 'qris' && (
              <>
                <div className="flex justify-between items-center">
                  <label htmlFor="bayar" className="text-lg">Bayar</label>
                  <input 
                    id="bayar" 
                    type="number" 
                    value={bayar}
                    onChange={(e) => setBayar(e.target.value)}
                    className="w-1/2 p-2 border rounded text-right" 
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg">Kembali</span>
                  <input 
                    id="kembali" 
                    type="text" 
                    value={kembali ? `Rp${Number(kembali).toLocaleString()}` : ''}
                    readOnly 
                    className="w-1/2 p-2 border rounded text-right bg-gray-100" 
                    placeholder="0"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-4 pt-4">
              <button onClick={handlePayment} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-bold text-lg">
                BAYAR
              </button>
              <button 
                className={`bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition ${!lastTransaction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                onClick={handlePrintReceipt}
                disabled={!lastTransaction}
              >
                Print Untuk Bukti Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* STRUK (Bukti Pembayaran) */}
      {showReceipt && lastTransaction && (
        <div ref={receiptRef} className="fixed left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50 print:bg-transparent print:static print:block">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md print:shadow-none print:p-2 print:rounded-none">
            <div className="text-center mb-2">
              <div className="text-xl font-bold">FASHION PARK</div>
              <div className="text-xs mb-1">Jl. Contoh Alamat No. 123, Kota Fashion</div>
              <div className="text-xs mb-2">Telp: 0812-3456-7890</div>
            </div>
            <hr className="mb-2" />
            <div className="text-sm mb-1">ID Transaksi: {lastTransaction.order_id}</div>
            <div className="text-sm mb-1">Kasir: {lastTransaction.kasir}</div>
            <div className="text-sm mb-1">Tanggal: {lastTransaction.waktu.toLocaleString('id-ID')}</div>
            <div className="text-sm mb-2">Metode: {lastTransaction.metode.toUpperCase()}</div>
            <table className="w-full text-xs mb-2">
              <thead>
                <tr>
                  <th className="text-left">Nama Barang</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Harga</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastTransaction.cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_name}</td>
                    <td className="text-right">{item.qty}</td>
                    <td className="text-right">Rp{Number(item.price).toLocaleString()}</td>
                    <td className="text-right">Rp{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr className="mb-2" />
            <div className="flex justify-between font-bold text-base mb-1">
              <span>Total</span>
              <span>Rp{Number(lastTransaction.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Bayar</span>
              <span>Rp{Number(lastTransaction.bayar).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>Kembali</span>
              <span>Rp{Number(lastTransaction.kembali).toLocaleString()}</span>
            </div>
            <div className="text-center text-xs mb-2 font-semibold">--- Terima kasih telah berbelanja di Fashion Park! ---</div>
            <div className="text-center text-xs mb-2">Struk ini sah tanpa tanda tangan</div>
            <div className="flex justify-center gap-2 print:hidden">
              <button onClick={handlePrintReceipt} className="bg-blue-600 text-white px-4 py-2 rounded">Print</button>
              <button onClick={handleCloseReceipt} className="bg-gray-400 text-white px-4 py-2 rounded">Tutup</button>
            </div>
          </div>
        </div>
      )}
      {showQRModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Scan QRIS untuk Pembayaran</h2>
            <QRCode value={qrString} size={256} />
            <button className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg" onClick={() => {
              setShowQRModal(false);
              // Setelah QR modal ditutup, tampilkan struk jika transaksi QRIS
              if (lastTransaction && lastTransaction.metode === 'qris') {
                setShowReceipt(true);
              }
            }}>
              Tutup
            </button>
          </div>
        </div>
      )}
      {/* Modal/tampilan untuk nomor VA */}
      {showVAModal && vaInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Transfer ke Virtual Account BCA</h2>
            <div className="text-lg mb-2">Nomor VA:</div>
            <div className="text-2xl font-mono font-bold mb-4">{vaInfo.va_number}</div>
            <div className="mb-2">Atas Nama: Fashion Park</div>
            <div className="mb-2">Nominal: <span className="font-bold">Rp{Number(vaInfo.gross_amount).toLocaleString()}</span></div>
            <div className="mb-4 text-sm text-gray-500">Silakan transfer ke nomor VA di atas melalui ATM, m-banking, atau internet banking BCA.</div>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg" onClick={() => setShowVAModal(false)}>Tutup</button>
          </div>
        </div>
      )}
      {/* Modal/tampilan untuk link Snap */}
      {showSnapModal && snapUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Pembayaran via Midtrans Snap</h2>
            <a href={snapUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg mb-4">Buka Link Pembayaran</a>
            <div className="mb-4 text-sm text-gray-500">Klik tombol di atas untuk membuka halaman pembayaran Midtrans Snap.<br/>Selesaikan pembayaran sesuai instruksi di halaman tersebut.</div>
            <button className="mt-4 bg-gray-400 text-white px-6 py-2 rounded-lg" onClick={() => setShowSnapModal(false)}>Tutup</button>
          </div>
        </div>
      )}
      {/* CSS khusus print */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print\:block, .print\:block * { visibility: visible !important; }
          .print\:block { position: absolute !important; left: 0; top: 0; width: 100vw !important; min-height: 100vh !important; background: white !important; z-index: 9999 !important; }
        }
      `}</style>
    </div>
  );
};

export default TransaksiPenjualan;
