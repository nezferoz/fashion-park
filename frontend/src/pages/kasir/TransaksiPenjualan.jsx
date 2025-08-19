import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaShoppingCart, FaTrash, FaEdit, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../utils/api';
import QRCode from 'qrcode.react';
import { getImageUrl } from '../../utils/imageUtils';

const TransaksiPenjualan = () => {
  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [vaInfo, setVaInfo] = useState(null);
  const [showVAModal, setShowVAModal] = useState(false);
  const [snapUrl, setSnapUrl] = useState(null);
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const kasirName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.name || 'Kasir';
    } catch {
      return 'Kasir';
    }
  })();

  // Fetch produk dari backend saat mount
  useEffect(() => {
    api.get('/products')
      .then(res => {
        console.log('Products loaded:', res.data);
        // Debug: Log stock data for each product
        res.data.forEach(product => {
          console.log(`Product: ${product.product_name}, main_image_id: ${product.main_image_id}, hasImage: ${!!product.main_image_id}`);
          if (product.variants && product.variants.length > 0) {
            console.log(`Product: ${product.product_name}, Total Stock: ${product.total_stock}, Variants:`, product.variants.map(v => ({
              size: v.size,
              stock_quantity: v.stock_quantity,
              variant_id: v.variant_id,
              barcode: v.barcode
            })));
          } else {
            console.log(`Product: ${product.product_name}, Total Stock: ${product.total_stock}`);
          }
        });
        setProducts(res.data);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setProducts([]);
      });
  }, []);

  // Tambah produk ke keranjang (default size pertama jika ada)
  const addToCart = (product) => {
    if (product) {
      let size = '-';
      let identifier = product.product_id;
      let barcode = product.barcode;
      let stockQuantity = 0;
      
      if (product.isVariant) {
        // Jika ini adalah variant, gunakan variant_id sebagai identifier
        size = product.size;
        identifier = product.variant_id;
        barcode = product.barcode;
        stockQuantity = product.stock_quantity || 0;
        console.log(`Adding variant: ${product.product_name} (${size}), Stock: ${stockQuantity}`);
      } else if (product.variants && product.variants.length > 0) {
        size = product.variants[0].size;
        barcode = product.variants[0].barcode;
        stockQuantity = product.variants[0].stock_quantity || 0;
        console.log(`Adding product with variant: ${product.product_name} (${size}), Stock: ${stockQuantity}`);
      } else if (product.size) {
        size = product.size;
        stockQuantity = product.total_stock || 0;
        console.log(`Adding product with size: ${product.product_name} (${size}), Stock: ${stockQuantity}`);
      } else {
        // Produk tanpa varian, gunakan total_stock
        stockQuantity = product.total_stock || 0;
        console.log(`Adding product without variant: ${product.product_name}, Stock: ${stockQuantity}`);
      }
      
      const existingProduct = cart.find(item => {
        if (product.isVariant) {
          return item.variant_id === product.variant_id;
        } else {
          return item.product_id === product.product_id && item.size === size;
        }
      });
      
      if (existingProduct) {
        // Cek apakah menambah quantity akan melebihi stok
        const newQty = existingProduct.qty + 1;
        console.log(`Existing item found: ${existingProduct.qty} in cart, trying to add 1 more. Stock available: ${stockQuantity}`);
        if (newQty > stockQuantity) {
          alert(`Stok tidak mencukupi! Stok tersedia: ${stockQuantity} pcs, sudah di keranjang: ${existingProduct.qty} pcs`);
          return;
        }
        
        const updatedCart = cart.map(item => {
          if (product.isVariant) {
            return item.variant_id === product.variant_id
              ? { ...item, qty: newQty, total: Number(item.price) * newQty }
              : item;
          } else {
            return item.product_id === product.product_id && item.size === size
              ? { ...item, qty: newQty, total: Number(item.price) * newQty }
              : item;
          }
        });
        setCart(updatedCart);
      } else {
        // Cek apakah stok mencukupi untuk menambah item baru
        if (stockQuantity <= 0) {
          alert(`Stok habis untuk produk: ${product.product_name}`);
          return;
        }
        
        const newItem = {
          product_id: product.product_id,
          variant_id: product.variant_id,
          product_name: product.product_name,
          brand: product.brand || '-',
          price: Number(product.price),
          qty: 1,
          total: Number(product.price),
          main_image_id: product.main_image_id,
          size: size,
          barcode: barcode,
          variants: product.variants || [],
          isVariant: product.isVariant || false,
          stock_quantity: stockQuantity
        };
        console.log(`Adding new item to cart:`, newItem);
        setCart([...cart, newItem]);
      }
    }
  };

  // Fungsi untuk menampilkan semua variant produk dalam hasil pencarian
  const getSearchResults = () => {
    if (searchTerm.trim() === '') return [];
    
    const keyword = searchTerm.trim().toLowerCase();
    const results = [];
    
    products.forEach(product => {
      // Cek apakah produk cocok dengan keyword
      const matchesKeyword = (product.product_name && product.product_name.toLowerCase().includes(keyword)) ||
        (product.barcode && product.barcode.toLowerCase().includes(keyword)) ||
        (product.product_id && String(product.product_id).includes(keyword));
      
      if (matchesKeyword) {
        if (product.variants && product.variants.length > 0) {
          // Jika ada variant, tampilkan setiap variant sebagai item terpisah
          product.variants.forEach(variant => {
            // Cek apakah variant ini cocok dengan keyword
            const variantMatchesKeyword = (variant.barcode && variant.barcode.toLowerCase().includes(keyword)) ||
              (variant.variant_id && String(variant.variant_id).includes(keyword)) ||
              (variant.size && variant.size.toLowerCase().includes(keyword));
            
            if (matchesKeyword || variantMatchesKeyword) {
              results.push({
                ...product,
                price: variant.price || product.price,
                size: variant.size,
                variant_id: variant.variant_id,
                barcode: variant.barcode, // Gunakan barcode dari variant
                stock_quantity: variant.stock_quantity || 0,
                main_image_id: product.main_image_id, // Pastikan main_image_id tersedia
                isVariant: true,
                displayName: `${product.product_name} (${variant.size}) - Stok: ${variant.stock_quantity || 0}`
              });
            }
          });
        } else {
          // Jika tidak ada variant, tampilkan produk asli dengan total stok
          results.push({
            ...product,
            size: product.size || '-',
            barcode: product.barcode || `P${String(product.product_id).padStart(4, '0')}`, // Gunakan barcode produk
            stock_quantity: product.total_stock || 0,
            main_image_id: product.main_image_id, // Pastikan main_image_id tersedia
            isVariant: false,
            displayName: `${product.product_name} - Stok: ${product.total_stock || 0}`
          });
        }
      }
    });
    
    return results;
  };

  // Update filteredProducts setiap searchTerm berubah
  useEffect(() => {
    const results = getSearchResults();
    console.log('Search result:', results);
    // Debug: Log main_image_id untuk setiap hasil pencarian
    results.forEach((item, index) => {
      console.log(`Search result ${index}:`, {
        product_name: item.product_name,
        main_image_id: item.main_image_id,
        hasImage: !!item.main_image_id
      });
    });
    setSearchResult(results);
  }, [searchTerm, products]);

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
      // Proses QRIS via Snap API (GoPay)
      try {
        const gross_amount = totalSemua;
        const res = await api.post('/payment/qris', { order_id, gross_amount });
        if (res.data && res.data.token) {
          // Gunakan Snap popup untuk QRIS (GoPay)
          if (!window.snap) {
            alert('Gagal memuat Snap.js');
            return;
          }
          window.snap.pay(res.data.token, {
            onSuccess: function () {
              showPaymentSuccess('Pembayaran QRIS berhasil!');
            },
            onPending: function () {
              showPaymentSuccess('Menunggu pembayaran QRIS...');
            },
            onError: function (result) {
              console.error('Snap QRIS error:', result);
              alert('Pembayaran QRIS gagal!');
            },
            onClose: function () {
              // User menutup popup tanpa menyelesaikan pembayaran
            }
          });
        } else {
          alert('Gagal mendapatkan token Snap dari Midtrans');
        }
      } catch (err) {
        alert('Gagal generate QRIS: ' + (err.response?.data?.message || err.message));
      }
      return;
    }
    
    if (paymentMethod === 'transfer') {
      // Gunakan Snap popup (tanpa pindah halaman) seperti pada halaman pelanggan
      try {
        const gross_amount = totalSemua;
        const res = await api.post('/payment/midtrans', {
          order_id,
          gross_amount,
          customer: { name: kasirName },
          payment_type: 'bank_transfer',
        });
        const { token } = res.data || {};
        if (!token) {
          alert('Gagal mendapatkan token Snap dari Midtrans');
          return;
        }
        if (!window.snap) {
          alert('Gagal memuat Snap.js');
          return;
        }
        window.snap.pay(token, {
          onSuccess: function () {
            showPaymentSuccess('Pembayaran berhasil!');
          },
          onPending: function () {
            showPaymentSuccess('Menunggu pembayaran...');
          },
          onError: function (result) {
            console.error('Snap error:', result);
            alert('Pembayaran gagal!');
          },
          onClose: function () {
            // User menutup popup tanpa menyelesaikan pembayaran
          }
        });
      } catch (err) {
        alert('Gagal membuat transaksi Snap: ' + (err.response?.data?.message || err.message));
      }
      return;
    }
    
    // Untuk cash - SIMPAN KE DATABASE
    const bayarAmount = parseFormattedNumber(bayar);
    if (!isNaN(bayarAmount) && bayarAmount >= totalSemua) {
      const kembaliAmount = bayarAmount - totalSemua;
      setKembali(formatNumber(kembaliAmount));
      
      try {
        // Dapatkan user ID kasir
        const user = JSON.parse(localStorage.getItem('user'));
        const kasirId = user?.userId;
        
        if (!kasirId) {
          alert('Kasir ID tidak ditemukan! Silakan login ulang.');
          return;
        }
        
        // Siapkan data transaksi
        const transactionData = {
          transaction_code: order_id,
          user_id: null, // Cash payment tanpa user
          cashier_id: kasirId,
          total_amount: totalSemua,
          discount: 0,
          final_amount: totalSemua,
          payment_method: 'cash',
          payment_status: 'paid',
          payment_reference: `CASH-${Date.now()}`,
          transaction_details: cart.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.qty,
            unit_price: item.price,
            subtotal: item.total
          }))
        };
        
        // Simpan transaksi ke database
        const res = await api.post('/transactions', transactionData);
        
        if (res.data && res.data.transaction_id) {
          console.log('Transaction saved:', res.data);
          
          // Simpan transaksi terakhir untuk struk
          setLastTransaction({
            waktu: currentTime,
            cart: [...cart],
            total: totalSemua,
            bayar: bayarAmount,
            kembali: kembaliAmount,
            metode: paymentMethod,
            order_id,
            kasir: kasirName,
            transaction_id: res.data.transaction_id
          });
          
          // Tampilkan notifikasi berhasil
          showPaymentSuccess('Pembayaran cash berhasil disimpan! Silakan tekan tombol Print Struk untuk mencetak.');
        } else {
          alert('Gagal menyimpan transaksi ke database!');
        }
      } catch (err) {
        console.error('Error saving transaction:', err);
        alert('Gagal menyimpan transaksi: ' + (err.response?.data?.message || err.message));
      }
    } else {
      alert('Jumlah bayar tidak cukup!');
    }
  };

  const handlePrintReceipt = () => {
    console.log('Print Struk clicked');
    console.log('lastTransaction:', lastTransaction);
    
    if (!lastTransaction) {
      console.log('No transaction found');
      alert('Lakukan pembayaran terlebih dahulu!');
      return;
    }
    
    console.log('Showing receipt...');
    // Tampilkan struk saja, tidak auto print
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    // Reset keranjang dan input setelah tutup struk
    resetAfterPrint();
  };

  // Fungsi untuk reset keranjang setelah pembayaran berhasil
  const resetAfterPayment = () => {
    setCart([]);
    setBayar("");
    setKembali("");
    setShowReceipt(false);
    setLastTransaction(null);
    setLastOrderId("");
    setShowQRModal(false);
    setShowSnapModal(false);
    setShowVAModal(false);
  };

  // Fungsi untuk menampilkan notifikasi berhasil
  const showPaymentSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
      // Hanya reset untuk QRIS dan Transfer, bukan untuk cash
      if (paymentMethod !== 'cash') {
        resetAfterPayment();
      }
    }, 3000);
  };

  // Fungsi untuk reset setelah print struk
  const resetAfterPrint = () => {
    setCart([]);
    setBayar("");
    setKembali("");
    setShowReceipt(false);
    setLastTransaction(null);
    setLastOrderId("");
  };

  const handleEditItem = (itemIdx) => {
    alert('Edit item (dummy handler)');
  };

  const handleDeleteItem = (itemIdx) => {
    const newCart = cart.filter((_, idx) => idx !== itemIdx);
    setCart(newCart);
  };

  const handleQtyChange = (index, newQty) => {
    if (newQty > 0) {
      const item = cart[index];
      const stockQuantity = item.stock_quantity || 0;
      
      if (newQty > stockQuantity) {
        alert(`Stok tidak mencukupi! Stok tersedia: ${stockQuantity} pcs`);
        return;
      }
      
      setCart(prevCart => 
        prevCart.map((item, idx) => 
          idx === index 
            ? { ...item, qty: newQty, total: Number(item.price) * newQty }
            : item
        )
      );
    }
  };

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + item.total, 0);
    setTotalSemua(newTotal);
  }, [cart]);

  useEffect(() => {
    if (bayar) {
      const bayarAmount = parseFormattedNumber(bayar);
      if (!isNaN(bayarAmount) && bayarAmount >= totalSemua) {
        const kembaliAmount = bayarAmount - totalSemua;
        setKembali(formatNumber(kembaliAmount));
      } else {
        setKembali('');
      }
    } else {
      setKembali('');
    }
  }, [bayar, totalSemua]);

  // Fungsi untuk format angka dengan pemisah ribuan
  const formatNumber = (number) => {
    return number.toLocaleString('id-ID');
  };

  // Fungsi untuk parse angka dari format dengan titik
  const parseFormattedNumber = (formattedNumber) => {
    return parseFloat(formattedNumber.replace(/\./g, '')) || 0;
  };

  // Handler untuk input bayar dengan format
  const handleBayarChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Hanya ambil angka
    const number = parseFloat(value) || 0;
    const formatted = formatNumber(number);
    setBayar(formatted);
  };

  // Handler untuk focus pada input bayar
  const handleBayarFocus = (e) => {
    e.target.select();
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Tambahkan fungsi handleSearch untuk filter produk saat tombol 'Cari' diklik
  const handleSearch = (e) => {
    e.preventDefault();
    const results = getSearchResults();
    console.log('Manual search result:', results);
    setSearchResult(results);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResult([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      // Hanya fokus ke barcode scanner jika tidak ada input yang sedang aktif
      if (barcodeInputRef.current && document.activeElement?.tagName !== 'INPUT') {
        barcodeInputRef.current.focus();
      }
    };
    window.addEventListener('click', handleFocus);
    return () => window.removeEventListener('click', handleFocus);
  }, []);

  // Tambahkan event listener untuk mencegah barcode scanner mengambil fokus saat user sedang mengetik
  useEffect(() => {
    const handleInputFocus = () => {
      // Ketika ada input yang fokus, jangan biarkan barcode scanner mengambil fokus
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== barcodeInputRef.current) {
        barcodeInputRef.current?.blur();
      }
    };

    const handleInputBlur = () => {
      // Ketika input kehilangan fokus, kembalikan fokus ke barcode scanner
      setTimeout(() => {
        if (document.activeElement?.tagName !== 'INPUT') {
          barcodeInputRef.current?.focus();
        }
      }, 100);
    };

    // Tambahkan event listener untuk semua input
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('focus', handleInputFocus);
      input.addEventListener('blur', handleInputBlur);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('blur', handleInputBlur);
      });
    };
  }, []);

  // Tambahkan event listener khusus untuk field pencarian
  useEffect(() => {
    const searchInput = searchInputRef.current;
    if (!searchInput) return;

    const handleSearchInputClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      searchInput.focus();
      searchInput.select();
    };

    const handleSearchInputMouseDown = (e) => {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    };

    searchInput.addEventListener('click', handleSearchInputClick);
    searchInput.addEventListener('mousedown', handleSearchInputMouseDown);

    return () => {
      searchInput.removeEventListener('click', handleSearchInputClick);
      searchInput.removeEventListener('mousedown', handleSearchInputMouseDown);
    };
  }, []);

  const handleBarcodeEnter = (e) => {
    if (e.key === 'Enter') {
      const id = barcodeInput.trim();
      console.log('Barcode scanner input:', id);
      
      // Cari berdasarkan barcode atau product_id di semua produk dan variant
      let found = null;
      
      for (const product of products) {
        // Cek product_id
        if (String(product.product_id) === id) {
          found = product;
          break;
        }
        // Cek barcode produk
        if (product.barcode && product.barcode === id) {
          found = product;
          break;
        }
        // Cek variant
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            if (String(variant.variant_id) === id || (variant.barcode && variant.barcode === id)) {
              found = {
                ...product,
                price: variant.price || product.price,
                size: variant.size,
                variant_id: variant.variant_id,
                barcode: variant.barcode,
                stock_quantity: variant.stock_quantity || 0,
                isVariant: true
              };
              break;
            }
          }
          if (found) break;
        }
      }
      
      if (found) {
        console.log('Found product:', found);
        addToCart(found);
      } else {
        console.log('Product not found for barcode:', id);
        alert('Produk tidak ditemukan');
      }
      setBarcodeInput('');
    }
  };

  // Handler untuk ubah size di keranjang - HAPUS FUNGSI INI
  // const handleChangeSize = (index, newSize) => {
  //   setCart(prevCart => {
  //     const item = prevCart[index];
  //     const existingIdx = prevCart.findIndex((it, idx) => idx !== index && it.product_id === item.product_id && it.size === newSize);
  //     if (existingIdx !== -1) {
  //       const updatedCart = prevCart.filter((_, idx) => idx !== index);
  //       updatedCart[existingIdx > index ? existingIdx - 1 : existingIdx] = {
  //         ...prevCart[existingIdx],
  //         qty: prevCart[existingIdx].qty + item.qty,
  //         total: prevCart[existingIdx].price * (prevCart[existingIdx].qty + item.qty),
  //       };
  //       return updatedCart;
  //     } else {
  //       return prevCart.map((it, idx) =>
  //         idx === index ? { ...it, size: newSize } : it
  //       );
  //     }
  //   });
  // };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 flex-1">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Kolom Kiri - PENCARIAN */}
        <div className="space-y-4 sm:space-y-6">
          {/* Card Pencarian */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-600">Pencarian Barang</h2>
            
            {/* Barcode Scanner */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Scan Barcode:</label>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                placeholder="Scan barcode atau ketik manual..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                onBlur={(e) => {
                  e.target.focus();
                  e.target.select();
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                style={{
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text'
                }}
              />
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama barang..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                onBlur={(e) => {
                  e.target.focus();
                  e.target.select();
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                style={{
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text'
                }}
              />
              <button type="submit" className="bg-blue-500 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition font-semibold text-sm sm:text-base">
                Cari
              </button>
            </form>
          </div>

          {/* Card Hasil Pencarian */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-600">Hasil Pencarian</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold">Gambar</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold hidden sm:table-cell">Barcode</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold">Nama Barang</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold hidden md:table-cell">Ukuran</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold">Stok</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold hidden lg:table-cell">Harga</th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResult.length > 0 ? (
                    searchResult.map((product, index) => (
                      <tr key={`${product.product_id}-${product.variant_id || index}`} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 sm:px-3 py-2">
                          {product.main_image_id ? (
                            <img 
                              src={getImageUrl(product.main_image_id)} 
                              alt={product.product_name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded"
                              onLoad={() => {
                                console.log(`✅ Image loaded successfully for product: ${product.product_name}, image_id: ${product.main_image_id}`);
                              }}
                              onError={(e) => {
                                console.log(`❌ Image failed to load for product: ${product.product_name}, image_id: ${product.main_image_id}`);
                                console.log(`❌ Image URL: ${e.target.src}`);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs ${product.main_image_id ? 'hidden' : ''}`}>
                            {product.product_name ? product.product_name.substring(0, 8) : 'No Image'}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-mono hidden sm:table-cell">
                          {product.barcode || '-'}
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-gray-500 sm:hidden">
                              {product.barcode || '-'} • {product.size || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm hidden md:table-cell">
                          {product.size || '-'}
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                          <span className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock_quantity || 0}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold hidden lg:table-cell">
                          Rp{Number(product.price).toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center">
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock_quantity <= 0}
                            className={`p-1 sm:p-2 rounded-full transition ${
                              product.stock_quantity > 0 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={product.stock_quantity <= 0 ? 'Stok habis' : 'Tambah ke keranjang'}
                          >
                            <FaPlus className="text-xs sm:text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : searchTerm.trim() !== '' ? (
                    <tr>
                      <td colSpan="7" className="border border-gray-200 px-3 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                        Tidak ada barang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="7" className="border border-gray-200 px-3 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
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
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-blue-600">
              <FaShoppingCart className="mr-2 sm:mr-3" /> KASIR
            </h2>
            <button onClick={handleResetCart} className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm sm:text-base">
              RESET KERANJANG
            </button>
          </div>
          <p className="mb-4 text-gray-600 text-sm sm:text-base">Tanggal: {currentTime.toLocaleString('id-ID')}</p>
          
          <div className="overflow-x-auto mb-4 sm:mb-6">
            <table className="w-full border-collapse border border-gray-200 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">No</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">Gambar</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">Nama Barang</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold hidden sm:table-cell">Barcode</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold hidden md:table-cell">Ukuran</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">Stok</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">Jumlah</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold hidden lg:table-cell">Total</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="border border-gray-200 px-3 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                      Keranjang kosong
                    </td>
                  </tr>
                ) : (
                  cart.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm">{index + 1}</td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2">
                        {item.main_image_id ? (
                          <img 
                            src={getImageUrl(item.main_image_id)} 
                            alt={item.product_name} 
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                            onLoad={() => {
                              console.log(`✅ Cart image loaded successfully for product: ${item.product_name}, image_id: ${item.main_image_id}`);
                            }}
                            onError={(e) => {
                              console.log(`❌ Cart image failed to load for product: ${item.product_name}, image_id: ${item.main_image_id}`);
                              console.log(`❌ Cart image URL: ${e.target.src}`);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs ${item.main_image_id ? 'hidden' : ''}`}>
                          {item.product_name ? item.product_name.substring(0, 6) : 'No Image'}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {item.barcode || '-'} • {item.size || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-mono hidden sm:table-cell">
                        {item.barcode || '-'}
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm hidden md:table-cell">
                        {item.size || '-'}
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                        <span className={`font-semibold ${item.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2">
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                          className="w-12 sm:w-16 p-1 border rounded text-xs sm:text-sm text-center" 
                          min="1"
                          max={item.stock_quantity}
                        />
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold hidden lg:table-cell">
                        Rp{Number(item.total).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <button className="text-blue-500 hover:text-blue-700 p-1" onClick={() => handleEditItem(index)} title="Edit">
                            <FaEdit className="text-xs sm:text-sm" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 p-1" onClick={() => handleDeleteItem(index)} title="Hapus">
                            <FaTrash className="text-xs sm:text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xl font-bold p-4 bg-gray-50 rounded-lg">
              <span>Total Semua</span>
              <span>Rp{Number(totalSemua).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="mr-2"
                /> Cash
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={() => setPaymentMethod("qris")}
                  className="mr-2"
                /> QRIS
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={() => setPaymentMethod("transfer")}
                  className="mr-2"
                /> Transfer
              </label>
            </div>
            
            {paymentMethod !== 'qris' && (
              <>
                <div className="flex justify-between items-center">
                  <label htmlFor="bayar" className="text-lg font-semibold">Bayar</label>
                  <input 
                    id="bayar" 
                    type="text" 
                    value={bayar}
                    onChange={handleBayarChange}
                    onFocus={handleBayarFocus}
                    className="w-1/2 p-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Kembali</span>
                  <input 
                    id="kembali" 
                    type="text" 
                    value={kembali}
                    readOnly 
                    className="w-1/2 p-3 border border-gray-300 rounded-lg text-right bg-gray-100" 
                    placeholder="0"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-4 pt-4">
              <button onClick={handlePayment} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-bold text-lg">
                BAYAR
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  lastTransaction 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                onClick={handlePrintReceipt}
                disabled={!lastTransaction}
                title={lastTransaction ? 'Print struk transaksi' : 'Lakukan pembayaran terlebih dahulu'}
              >
                Print Struk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi Berhasil */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="font-semibold">{successMessage}</span>
          <button 
            onClick={() => setShowSuccessNotification(false)}
            className="ml-2 hover:text-gray-200"
          >
            <FaTimesCircle />
          </button>
        </div>
      )}

      {/* STRUK (Bukti Pembayaran) - Disesuaikan untuk kertas 58mm */}
      {showReceipt && lastTransaction && (
        <div ref={receiptRef} className="fixed left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50 print:bg-transparent print:static print:block">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-[200px] print:shadow-none print:p-1 print:rounded-none print:block print:w-[200px] print:max-w-none print-thermal">
            {/* Header */}
            <div className="text-center mb-1 print:mb-1">
              <div className="text-sm font-bold print:text-xs font-mono">TOKO FASHION PARK</div>
              <div className="text-[8px] print:text-[7px] mb-0.5 font-mono">Sintang</div>
              <div className="text-[8px] print:text-[7px] mb-0.5 font-mono">Jl. Lintas Melawi, Ladang</div>
              <div className="text-[8px] print:text-[7px] mb-0.5 font-mono">Kec. Sintang, Kab. Sintang, Kalbar</div>
              <div className="text-[8px] print:text-[7px] mb-0.5 font-mono">Sekadau</div>
              <div className="text-[8px] print:text-[7px] mb-0.5 font-mono">Jl. Irian, Sungai Ringin</div>
              <div className="text-[8px] print:text-[7px] mb-1 font-mono">Kec. Sekadau Hilir, Kab. Sekadau, Kalbar</div>
            </div>
            
            {/* Garis pemisah */}
            <div className="border-t border-black mb-1"></div>
            
            {/* Informasi Transaksi */}
            <div className="text-[8px] print:text-[7px] mb-1 font-mono">
              <div>ID: {lastTransaction.order_id}</div>
              <div>Kasir: {lastTransaction.kasir}</div>
              <div>Tanggal: {lastTransaction.waktu.toLocaleDateString('id-ID')}</div>
              <div>Waktu: {lastTransaction.waktu.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
              <div>Metode: {lastTransaction.metode.toUpperCase()}</div>
            </div>
            
            {/* Garis pemisah */}
            <div className="border-t border-black mb-1"></div>
            
            {/* Items */}
            {lastTransaction.cart.map((item, idx) => (
              <div key={idx} className="text-[8px] print:text-[7px] mb-1 font-mono">
                <div className="flex justify-between items-start">
                  {/* Sebelah kiri: Nama barang, ukuran, harga satuan, jumlah */}
                  <div className="flex-1 text-left">
                    <div className="font-bold text-[9px] print:text-[8px]">
                      {item.product_name}
                    </div>
                                         <div className="text-[7px] print:text-[6px] text-gray-600">
                       Ukuran: {item.variant_name || item.size || '-'}
                     </div>
                    <div className="text-[7px] print:text-[6px]">
                      Rp{Number(item.price).toLocaleString()} x {item.qty}
                    </div>
                  </div>
                  {/* Sebelah kanan: Total harga */}
                  <div className="text-right font-bold">
                    <div className="text-[9px] print:text-[8px]">
                      Rp{Number(item.total).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Garis pemisah */}
            <div className="border-t border-black mb-1"></div>
            
            {/* Total dan Pembayaran */}
            <div className="text-[8px] print:text-[7px] mb-1 font-mono">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="font-mono">Rp {Number(lastTransaction.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar</span>
                <span className="font-mono">Rp {Number(lastTransaction.bayar).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembali</span>
                <span className="font-mono">Rp {Number(lastTransaction.kembali).toLocaleString()}</span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center text-[8px] print:text-[7px] mb-1 font-mono">
              <div>Terima Kasih & Selamat Belanja</div>
            </div>
            
            {/* Tombol untuk preview (tidak akan tercetak) */}
            <div className="flex justify-center gap-2 print:hidden mt-2">
              <button 
                onClick={() => {
                  const printContent = receiptRef.current;
                  if (printContent) {
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'absolute';
                    iframe.style.left = '-9999px';
                    iframe.style.top = '-9999px';
                    document.body.appendChild(iframe);
                    
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
                                font-size: 11px;
                                line-height: 1.5;
                                width: 180px;
                                margin: 0 auto;
                                page-break-inside: avoid;
                                page-break-after: avoid;
                                page-break-before: avoid;
                                color: black !important;
                                background: white !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                              }
                              .print-thermal { 
                                width: 180px !important; 
                                max-width: 180px !important; 
                                margin: 0 auto;
                                text-align: center;
                                page-break-inside: avoid;
                                color: black !important;
                                background: white !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                min-height: 400px !important;
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
                              .mb-0 { margin-bottom: 0 !important; }
                              .mb-0\.5 { margin-bottom: 2px !important; }
                              .text-center { text-align: center !important; }
                              .text-right { text-align: right !important; }
                              .text-left { text-align: left !important; }
                              .font-bold { font-weight: bold !important; }
                              .font-semibold { font-weight: 600 !important; }
                              .font-mono { font-weight: 500 !important; }
                              .border-t { border-top: 1px solid black !important; }
                              .break-words { word-break: break-word !important; }
                              .leading-tight { line-height: 1.5 !important; }
                              .text-\[8px\] { font-size: 9px !important; }
                              .text-\[7px\] { font-size: 8px !important; }
                              .text-\[6px\] { font-size: 7px !important; }
                              .text-\[5px\] { font-size: 6px !important; }
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
                                color: black !important;
                                background: transparent !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
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
                            .mb-0 { margin-bottom: 0; }
                            .mb-0\.5 { margin-bottom: 2px; }
                            .text-center { text-align: center; }
                            .text-right { text-align: right; }
                            .text-left { text-align: left; }
                            .font-bold { font-weight: bold; }
                            .font-semibold { font-weight: 600; }
                            .font-mono { font-weight: 500; }
                            .border-t { border-top: 1px solid black; }
                            .break-words { word-break: break-word; }
                            .leading-tight { line-height: 1.5; }
                            .text-\[8px\] { font-size: 9px; }
                            .text-\[7px\] { font-size: 8px; }
                            .text-\[6px\] { font-size: 7px; }
                            .text-\[5px\] { font-size: 6px; }
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
                              -webkit-print-color-adjust: exact;
                              print-color-adjust: exact;
                            }
                            .print-thermal div {
                              display: block;
                            }
                            .print-thermal {
                              display: block;
                              visibility: visible;
                            }
                          </style>
                        </head>
                        <body>
                          ${printContent.innerHTML}
                        </body>
                      </html>
                    `);
                    
                    iframe.contentDocument.close();
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    
                    setTimeout(() => {
                      document.body.removeChild(iframe);
                    }, 1000);
                  }
                }} 
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Print
              </button>
              <button onClick={handleCloseReceipt} className="bg-gray-400 text-white px-3 py-1 rounded text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QRIS */}
      {showQRModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Scan QRIS untuk Pembayaran</h2>
            <QRCode value={qrString} size={256} />
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>QRIS berhasil dibuat!</p>
              <p>Silakan scan QR code di atas untuk pembayaran.</p>
            </div>
            <button className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg" onClick={() => {
              setShowQRModal(false);
              // HAPUS otomatis menampilkan struk
              // if (lastTransaction && lastTransaction.metode === 'qris') {
              //   setShowReceipt(true);
              // }
            }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal VA */}
      {showVAModal && vaInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Transfer ke Virtual Account BCA</h2>
            <div className="text-lg mb-2">Nomor VA:</div>
            <div className="text-2xl font-mono font-bold mb-4">{vaInfo.va_number}</div>
            <div className="mb-2">Atas Nama: Fashion Park</div>
            <div className="mb-2">Nominal: <span className="font-bold">Rp{Number(vaInfo.gross_amount).toLocaleString()}</span></div>
            <div className="mb-4 text-sm text-gray-500">Silakan transfer ke nomor VA di atas melalui ATM, m-banking, atau internet banking BCA.</div>
            <div className="text-sm text-green-600 font-semibold mb-4">
              Transfer berhasil dibuat! Silakan lakukan pembayaran.
            </div>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg" onClick={() => setShowVAModal(false)}>Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Snap */}
      {showSnapModal && snapUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Pembayaran via Midtrans Snap</h2>
            <a href={snapUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg mb-4">Buka Link Pembayaran</a>
            <div className="mb-4 text-sm text-gray-500">Klik tombol di atas untuk membuka halaman pembayaran Midtrans Snap.<br/>Selesaikan pembayaran sesuai instruksi di halaman tersebut.</div>
            <div className="text-sm text-green-600 font-semibold mb-4">
              Link pembayaran berhasil dibuat! Silakan klik link untuk pembayaran.
            </div>
            <button className="mt-4 bg-gray-400 text-white px-6 py-2 rounded-lg" onClick={() => setShowSnapModal(false)}>Tutup</button>
          </div>
        </div>
      )}

      {/* CSS khusus print untuk kertas 58mm */}
      <style>{`
        @media print {
          body * { 
            visibility: hidden !important; 
          }
          .print\\:block, .print\\:block * { 
            visibility: visible !important; 
          }
          .print\\:block { 
            position: absolute !important; 
            left: 50% !important; 
            top: 0 !important; 
            transform: translateX(-50%) !important;
            width: 200px !important; 
            min-height: auto !important; 
            background: white !important; 
            z-index: 9999 !important; 
            margin: 0 !important;
            padding: 1px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            font-family: monospace !important;
            line-height: 1.2 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TransaksiPenjualan;
