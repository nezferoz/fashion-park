import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../utils/api";
import Barcode from "react-barcode";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SIZE_OPTIONS = {
  'Celana': ["29", "30", "31", "32", "33", "34", "35", "36"],
  'Kemeja': ["S", "M", "L", "XL", "XXL"],
  'Kaos': ["S", "M", "L", "XL", "XXL"],
  'Jaket': ["S", "M", "L", "XL", "XXL"],
  'Celana Pendek': ["29", "30", "31", "32", "33", "34", "35", "36"],
  'Celana Panjang': ["29", "30", "31", "32", "33", "34", "35", "36"],
};
const ACCESSORY_CATEGORIES = ["Aksesoris"];

function formatRupiah(num) {
  if (!num && num !== 0) return "";
  return "Rp" + Number(num).toLocaleString("id-ID");
}

// Komponen baru untuk tampilan cetak barcode
const PrintableBarcode = React.forwardRef(({ product }, ref) => {
  if (!product) return null;
  return (
    <div ref={ref} className="printable-area">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-area, .printable-area * {
              visibility: visible;
            }
            .printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .barcode-container {
              text-align: center;
              border: 1px solid #ccc;
              padding: 20px;
            }
          }
        `}
      </style>
      <div className="barcode-container">
        <h4>{product.product_name}</h4>
        <p>{formatRupiah(product.price)}</p>
        <Barcode value={product.product_id.toString()} />
      </div>
    </div>
  );
});

// Komponen reusable untuk grid barcode multi
const BarcodeGrid = React.forwardRef(({ products }, ref) => {
  // Tambahkan placeholder agar kelipatan 5
  const items = [...products];
  const remainder = items.length % 5;
  if (remainder !== 0) {
    for (let i = 0; i < 5 - remainder; i++) {
      items.push({ product_id: `placeholder-${i}`, placeholder: true });
    }
  }
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0,
        background: '#fff',
        padding: 0,
        margin: '24px 0',
        width: 1240,
        minHeight: 120,
        border: '2px solid #0074D9',
      }}
    >
      {items.map((product, idx) => (
        product.placeholder ? (
          <div key={product.product_id} style={{ width: '100%', height: 120, background: '#f8f8f8', margin: 0, padding: 0 }}></div>
        ) : (
          <div
            key={product.product_id}
            style={{
              width: '100%',
              height: 120,
              textAlign: 'center',
              margin: 0,
              padding: 0,
              background: '#fff',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #eee',
            }}
          >
            <Barcode
              value={product.product_id.toString()}
              width={1.5}
              height={60}
              fontSize={12}
              margin={0}
              displayValue={false}
            />
            <div style={{ fontSize: 10, marginTop: 0, letterSpacing: 1 }}>
              BC{String(product.product_id).padStart(3, '0')}
            </div>
          </div>
        )
      ))}
    </div>
  );
});

const ManajemenProduk = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_name: "", price: "", category_id: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [productToPrint, setProductToPrint] = useState(null);
  const printRef = useRef();
  const fileInputRef = useRef();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [variants, setVariants] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState([]);
  const [showMultiPrint, setShowMultiPrint] = useState(false);
  const multiPrintRef = useRef();
  const barcodePdfRef = useRef();
  const barcodeMultiPdfRef = useRef();
  const [pendingDownload, setPendingDownload] = useState(null); // { type: 'single'|'multi', product: obj|null }

  // Perbaiki handlePrint agar hanya untuk print
  const handlePrint = (product) => {
    setProductToPrint(product);
    setTimeout(() => {
      if (printRef.current) {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        setProductToPrint(null);
        setTimeout(() => window.location.reload(), 100);
      }
    }, 100);
  };
  
  useEffect(() => {
    if (productToPrint) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      setProductToPrint(null);
      // a small delay to ensure the content is restored before continuing
      setTimeout(() => window.location.reload(), 100);
    }
  }, [productToPrint]);

  const fetchProduk = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products");
      setProduk(res.data);
    } catch {
      setError("Gagal mengambil data produk");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchProduk();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImagePreviews(files.map(file => ({ src: URL.createObjectURL(file), file })));
    } else {
      setImagePreviews([]);
    }
  };

  const handleDragStart = useCallback((idx) => setDraggedIdx(idx), []);
  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setImagePreviews(prev => {
      const newArr = [...prev];
      const [dragged] = newArr.splice(draggedIdx, 1);
      newArr.splice(idx, 0, dragged);
      return newArr;
    });
    setDraggedIdx(idx);
  }, [draggedIdx]);
  const handleDragEnd = useCallback(() => setDraggedIdx(null), []);

  const handleAddVariant = () => {
    setVariants([...variants, { size: '', stock_quantity: 0 }]);
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants(variants.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariant = (idx) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setForm({ product_name: "", price: "", category_id: "", description: "" });
    setEditId(null);
    setShowForm(true);
    setSuccess("");
    setError("");
    setVariants([]);
  };

  const handleEdit = (prod) => {
    setForm({
      product_name: prod.product_name,
      price: prod.price,
      category_id: prod.category_id,
      description: prod.description || "",
    });
    setEditId(prod.product_id);
    setShowForm(true);
    setSuccess("");
    setError("");
    // fetch variants
    api.get(`/products/${prod.product_id}`).then(res => {
      setVariants(res.data.variants || []);
    });
    // fetch images
    api.get(`/products/${prod.product_id}/images`).then(res => {
      setUploadedImages(res.data || []);
    });
    setImagePreviews([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus produk ini?")) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccess("Produk berhasil dihapus");
      fetchProduk();
    } catch {
      setError("Gagal menghapus produk");
    }
  };

  const handleDeleteUploadedImage = async (img) => {
    if (!window.confirm("Hapus gambar ini?")) return;
    try {
      await api.delete(`/products/images/${img.image_id}`);
      setUploadedImages(uploadedImages.filter(i => i.image_id !== img.image_id));
      toast.success("Gambar berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus gambar");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.product_name) errors.product_name = 'Nama produk wajib diisi';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Harga harus lebih dari 0';
    if (!form.category_id) errors.category_id = 'Kategori wajib dipilih';
    const catName = categories.find(c => c.category_id == form.category_id)?.category_name;
    if (!ACCESSORY_CATEGORIES.includes(catName) && variants.length === 0) errors.variants = 'Minimal 1 varian wajib diisi';
    if (!editId && imagePreviews.length === 0) errors.image = 'Minimal 1 gambar produk wajib diupload';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormErrors({});
    setLoadingSubmit(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoadingSubmit(false);
      return;
    }
    try {
      let productId = editId;
      const formToSend = {
        ...form,
        price: Number((form.price + '').replace(/[^\d.]/g, '').replace(',', '.')),
        stock_quantity: 0,
        barcode: '',
        is_active: true
      };
      if (editId) {
        await api.put(`/products/${editId}`, formToSend);
        setSuccess("Produk berhasil diupdate");
        toast.success("Produk berhasil diupdate");
        productId = editId;
      } else {
        const res = await api.post("/products", formToSend);
        productId = res.data.product_id || res.data.id;
        setSuccess("Produk berhasil ditambah");
        toast.success("Produk berhasil ditambah");
      }
      // Simpan varian
      const catName = categories.find(c => c.category_id == form.category_id)?.category_name;
      if (!ACCESSORY_CATEGORIES.includes(catName)) {
        for (const v of variants) {
          if (!v.variant_id) {
            await api.post(`/products/${productId}/variants`, { product_id: productId, size: v.size, stock_quantity: Number(v.stock_quantity) });
          } else {
            await api.put(`/products/variants/${v.variant_id}`, { variant_id: v.variant_id, size: v.size, stock_quantity: Number(v.stock_quantity) });
          }
        }
      }
      // Upload multi gambar jika ada file (tambah atau edit produk)
      if (imagePreviews.length > 0) {
        const formData = new FormData();
        imagePreviews.forEach(({file}) => {
          formData.append("images", file);
        });
        try {
          console.log('Uploading images for product', productId, formData);
          const res = await api.post(`/products/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log('Upload image response:', res);
        } catch (err) {
          setError("Upload gambar gagal: " + (err.response?.data?.message || err.message));
          toast.error("Upload gambar gagal: " + (err.response?.data?.message || err.message));
          console.error('Upload image error:', err);
        }
      }
      setShowForm(false);
      await fetchProduk();
      setImagePreviews([]);
      setForm({ product_name: "", price: "", category_id: "", description: "" });
      setVariants([]);
    } catch {
      setError("Gagal menyimpan produk");
      toast.error("Gagal menyimpan produk");
    }
    setLoadingSubmit(false);
  };

  const handleSelectProduk = (id) => {
    setSelectedProduk((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProduk.length === produk.length) {
      setSelectedProduk([]);
    } else {
      setSelectedProduk(produk.map((p) => p.product_id));
    }
  };

  const handleMultiPrint = () => {
    setShowMultiPrint(true);
  };

  useEffect(() => {
    if (showMultiPrint) {
      setTimeout(() => {
        const printContents = multiPrintRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        setShowMultiPrint(false);
        setTimeout(() => window.location.reload(), 100);
      }, 100);
    }
  }, [showMultiPrint]);

  // Download PDF single barcode
  const downloadBarcodePDF = (product) => {
    setProductToPrint(product);
    setPendingDownload({ type: 'single', product });
  };

  // Download PDF multi barcode
  const downloadMultiBarcodePDF = () => {
    setShowMultiPrint(true); // tetap set true agar proses berjalan
    setPendingDownload({ type: 'multi', product: null });
  };

  // Trigger download PDF setelah render barcode selesai
  useEffect(() => {
    if (pendingDownload?.type === 'single' && productToPrint && barcodePdfRef.current) {
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(barcodePdfRef.current);
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [200, 120] });
          pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
          pdf.save(`barcode_${productToPrint.product_id}.pdf`);
        } catch (err) {
          alert('Gagal generate PDF barcode. Pastikan browser mendukung.');
        }
        setProductToPrint(null);
        setPendingDownload(null);
      }, 200);
    } else if (pendingDownload?.type === 'multi') {
      if (!barcodeMultiPdfRef.current) {
        setShowMultiPrint(false);
        setPendingDownload(null);
        return;
      }
      setTimeout(async () => {
        try {
          // Ukuran A4: 1240x1754px (300dpi)
          const canvas = await html2canvas(barcodeMultiPdfRef.current, { backgroundColor: '#fff', scale: 3, width: 1240, height: 1754 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
          pdf.addImage(imgData, 'PNG', 0, 0, 595, 842);
          pdf.save(`barcode_multi.pdf`);
        } catch (err) {
          alert('Gagal generate PDF barcode multi. Pastikan browser mendukung.');
        }
        setShowMultiPrint(false);
        setPendingDownload(null);
      }, 200);
    }
  }, [pendingDownload, productToPrint, showMultiPrint]);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Manajemen Produk</h2>
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
        <button onClick={handleAdd} className="mb-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Tambah Produk</button>
        <button
          onClick={handleMultiPrint}
          disabled={selectedProduk.length === 0}
          className={`mb-4 ml-4 px-6 py-2 rounded font-semibold transition ${selectedProduk.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          Print Barcode Terpilih
        </button>
        <button
          onClick={downloadMultiBarcodePDF}
          disabled={selectedProduk.length === 0}
          className={`mb-4 ml-4 px-6 py-2 rounded font-semibold transition ${selectedProduk.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
        >
          Download PDF Barcode Terpilih
        </button>
        {/* Tampilkan grid barcode multi di halaman dan gunakan ref untuk PDF */}
        {selectedProduk.length > 0 && (
          <BarcodeGrid
            ref={barcodeMultiPdfRef}
            products={produk.filter(p => selectedProduk.includes(p.product_id))}
          />
        )}
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedProduk.length === produk.length && produk.length > 0} onChange={handleSelectAll} /></th>
              <th className="text-left">Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((prod) => (
              <tr key={prod.product_id}>
                <td><input type="checkbox" checked={selectedProduk.includes(prod.product_id)} onChange={() => handleSelectProduk(prod.product_id)} /></td>
                <td>{prod.product_name}</td>
                <td>{categories.find((c) => c.category_id === prod.category_id)?.category_name || '-'}</td>
                <td>{formatRupiah(prod.price)}</td>
                <td>{prod.description}</td>
                <td className="flex gap-2 items-center">
                  <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(prod.product_id)} className="text-red-500 hover:underline">Hapus</button>
                  <button onClick={() => handlePrint(prod)} className="text-green-600 hover:underline">Print Barcode</button>
                  <button onClick={() => downloadBarcodePDF(prod)} className="text-purple-600 hover:underline">Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Render barcode single dan multi ke elemen hidden */}
        <div style={{ display: 'none' }}>
          <PrintableBarcode ref={printRef} product={productToPrint} />
          {productToPrint && (
            <div ref={barcodePdfRef}>
              <div style={{ background: '#fff', padding: 20, textAlign: 'center' }}>
                <h4 style={{ margin: 0 }}>{productToPrint.product_name}</h4>
                <p style={{ margin: 0 }}>{formatRupiah(productToPrint.price)}</p>
                <Barcode value={productToPrint.product_id.toString()} />
              </div>
            </div>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-blue-100">
            <div>
              <label className="block font-semibold mb-1">Nama Produk</label>
              <input type="text" name="product_name" value={form.product_name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              {formErrors.product_name && <div className="text-red-500 text-sm mt-1">{formErrors.product_name}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
              {formErrors.category_id && <div className="text-red-500 text-sm mt-1">{formErrors.category_id}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Harga</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              {formErrors.price && <div className="text-red-500 text-sm mt-1">{formErrors.price}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Gambar Produk</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full border rounded px-3 py-2" multiple />
              <div className="text-xs text-gray-500 mt-1 mb-2">Urutkan gambar dengan drag & drop sesuai keinginan. Gambar pertama akan menjadi gambar utama.</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {/* Gambar dari backend */}
                {uploadedImages.map((img, idx) => (
                  <div key={img.image_id} className="relative">
                    <img src={`http://localhost:5000${img.url}`} alt={`Uploaded ${idx+1}`} className="h-24 rounded border-2 border-gray-200" />
                    <button
                      type="button"
                      onClick={() => handleDeleteUploadedImage(img)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                      title="Hapus gambar"
                    >X</button>
                  </div>
                ))}
                {/* Gambar baru yang akan diupload */}
                {imagePreviews.map(({src}, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx+1}`}
                    className={`h-24 rounded border-2 ${draggedIdx === idx ? 'border-blue-500' : 'border-gray-200'}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    title="Drag untuk mengurutkan"
                  />
                ))}
              </div>
              {formErrors.image && <div className="text-red-500 text-sm mt-1">{formErrors.image}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Varian Ukuran & Stok</label>
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <select value={v.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Pilih Ukuran</option>
                    {SIZE_OPTIONS[categories.find(c => c.category_id == form.category_id)?.category_name]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <input type="number" min="0" value={v.stock_quantity} onChange={e => handleVariantChange(idx, 'stock_quantity', e.target.value)} className="border rounded px-2 py-1 w-24" placeholder="Stok" />
                  <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500">Hapus</button>
                </div>
              ))}
              <button type="button" onClick={handleAddVariant} className="bg-blue-200 text-blue-800 px-3 py-1 rounded">Tambah Varian</button>
              {formErrors.variants && <div className="text-red-500 text-sm mt-1">{formErrors.variants}</div>}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loadingSubmit}>{loadingSubmit ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); setImagePreviews([]); setDraggedIdx(null); }} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition" disabled={loadingSubmit}>Batal</button>
            </div>
          </form>
        )}
      </div>
      <div style={{ position: 'fixed', zIndex: 9999, right: 20, top: 20 }}>
        <ToastContainer autoClose={2500} />
      </div>
    </div>
  );
};

export default ManajemenProduk; 