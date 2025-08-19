import React, { useCallback, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../utils/api";

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
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
          .barcode-container { text-align: center; border: 1px solid #ccc; padding: 20px; }
        }
      `}</style>
      <div className="barcode-container">
        <h4>{product.product_name}</h4>
        <p>{formatRupiah(product.price)}</p>
        <Barcode value={product.barcode ? product.barcode : product.product_id.toString()} />
      </div>
    </div>
  );
});

const ManajemenProduk = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_name: "", price: "", category_id: "", description: "", weight: "" });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [productToPrint, setProductToPrint] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [variants, setVariants] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState([]);
  const barcodePdfRef = useRef();
  const [pendingDownload, setPendingDownload] = useState(null); // { type: 'single'|'multi', product: obj|null }
  const fileInputRef = useRef();
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);

  // Handler select varian
  const handleSelectVariant = (variant_id) => {
    setSelectedVariantIds((prev) =>
      prev.includes(variant_id) ? prev.filter((vid) => vid !== variant_id) : [...prev, variant_id]
    );
  };
  const handleSelectAllVariants = () => {
    const allVariantIds = produk.flatMap(p => (p.variants || []).map(v => v.variant_id));
    if (selectedVariantIds.length === allVariantIds.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(allVariantIds);
    }
  };

  // Handler print massal (desktop - 1x3 cm)
  // Handler print barcode horizontal (produk - 0,7x0,3 cm)
  const handlePrintBarcodeHorizontal = async () => {
    if (selectedVariantIds.length === 0) return toast.error('Pilih varian/produk yang ingin dicetak!');
    // Kumpulkan variant_ids dan product_ids
    const variant_ids = [];
    const product_ids = [];
    for (const id of selectedVariantIds) {
      // Cek apakah id adalah variant_id dari produk manapun
      let found = false;
      for (const p of produk) {
        if (p.variants && p.variants.some(v => v.variant_id === id)) {
          variant_ids.push(id);
          found = true;
          break;
        }
      }
      if (!found) {
        // Jika tidak ditemukan di varian, berarti ini product_id produk tanpa varian
        product_ids.push(id);
      }
    }
    try {
      const res = await api.post('/products/print-barcodes-horizontal', { variant_ids, product_ids }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'barcodes-horizontal.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Gagal print barcode horizontal');
    }
  };

  useEffect(() => {
    if (showPrintModal && productToPrint) {
      setTimeout(() => {
        window.print();
        setShowPrintModal(false);
        setProductToPrint(null);
      }, 300);
    }
  }, [showPrintModal, productToPrint]);

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
    setImagePreviews([]);
    setUploadedImages([]);
  };

  const handleEdit = (prod) => {
    setForm({
      product_name: prod.product_name,
      price: prod.price,
      category_id: prod.category_id,
      description: prod.description || "",
      weight: prod.weight || "",
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
    if (ACCESSORY_CATEGORIES.includes(catName)) {
      // Untuk aksesoris, pastikan ada input stok
      if (!variants[0]?.stock_quantity || Number(variants[0].stock_quantity) < 0) {
        errors.variants = 'Stok aksesoris wajib diisi';
      }
    } else {
      // Untuk produk dengan ukuran, pastikan ada varian
      if (variants.length === 0) errors.variants = 'Minimal 1 varian wajib diisi';
    }
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
        weight: Number(form.weight) || 0,
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
      if (ACCESSORY_CATEGORIES.includes(catName)) {
        // Untuk aksesoris, buat satu varian tanpa ukuran dengan stok dari input
        const accessoryStock = variants[0]?.stock_quantity || 0;
        await api.post(`/products/${productId}/variants`, { 
          product_id: productId, 
          size: '', 
          stock_quantity: Number(accessoryStock) 
        });
      } else {
        // Untuk produk dengan ukuran, simpan semua varian
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
      setForm({ product_name: "", price: "", category_id: "", description: "", weight: "" });
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

  const handlePrint = (item) => {
    // item bisa varian (punya barcode, size) atau produk (punya barcode, tidak ada size)
    setProductToPrint(item);
    setShowPrintModal(true);
  };

  // Hitung semua ID yang bisa dipilih (variant_id untuk varian, product_id untuk produk tanpa varian)
  const allSelectableIds = produk.flatMap(p =>
    (p.variants && p.variants.length > 0)
      ? p.variants.map(v => v.variant_id)
      : [p.product_id]
  );

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Manajemen Produk</h2>
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
        
        {/* Tombol bersebelahan */}
        <div className="flex gap-4 mb-4">
          <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">
            Tambah Produk
          </button>
          <button onClick={handlePrintBarcodeHorizontal} className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition">
            Print Barcode
          </button>
        </div>
        
        <table className="w-full mb-6 border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-white font-bold">
              <th className="border-b border-gray-300 px-3 py-2 text-left"><input type="checkbox" checked={selectedVariantIds.length === allSelectableIds.length && allSelectableIds.length > 0} onChange={() => {
                    if (selectedVariantIds.length === allSelectableIds.length) {
                      setSelectedVariantIds([]);
                    } else {
                      setSelectedVariantIds(allSelectableIds);
                    }
                  }} /></th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">Nama Produk</th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">Ukuran</th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">Barcode</th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((prod) => {
              // Jika produk punya varian, render satu baris per varian
              if (prod.variants && prod.variants.length > 0) {
                return prod.variants.map((variant, idx) => (
                  <tr key={variant.variant_id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2"><input type="checkbox" checked={selectedVariantIds.includes(variant.variant_id)} onChange={() => handleSelectVariant(variant.variant_id)} /></td>
                    <td className="border-b border-gray-200 px-3 py-2">{prod.product_name}</td>
                    <td className="border-b border-gray-200 px-3 py-2">{variant.size || '-'}</td>
                    <td className="border-b border-gray-200 px-3 py-2">{variant.barcode}</td>
                    <td className="border-b border-gray-200 px-3 py-2 flex gap-2 items-center">
                      <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(prod.product_id)} className="text-red-500 hover:underline">Hapus</button>
                      <button onClick={() => handlePrint({ ...variant, product_name: prod.product_name })} className="text-green-600 hover:underline">Print Barcode</button>
                    </td>
                  </tr>
                ));
              } else {
                // Produk tanpa varian (misal: aksesoris)
                return (
                  <tr key={prod.product_id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2"><input type="checkbox" checked={selectedVariantIds.includes(prod.product_id)} onChange={() => handleSelectVariant(prod.product_id)} /></td>
                    <td className="border-b border-gray-200 px-3 py-2">{prod.product_name}</td>
                    <td className="border-b border-gray-200 px-3 py-2">-</td>
                    <td className="border-b border-gray-200 px-3 py-2">{prod.barcode || '-'}</td>
                    <td className="border-b border-gray-200 px-3 py-2 flex gap-2 items-center">
                      <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(prod.product_id)} className="text-red-500 hover:underline">Hapus</button>
                      <button onClick={() => handlePrint(prod)} className="text-green-600 hover:underline">Print Barcode</button>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
        {/* Render barcode single dan multi ke elemen hidden */}
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
              <input 
                type="text" 
                name="price" 
                value={form.price ? Number(form.price).toLocaleString('id-ID') : ''} 
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  handleChange({
                    target: {
                      name: 'price',
                      value: value
                    }
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  if (value) {
                    e.target.value = Number(value).toLocaleString('id-ID');
                  }
                }}
                className="w-full border rounded px-3 py-2" 
                required 
                placeholder="Contoh: 1.230.000"
              />
              {formErrors.price && <div className="text-red-500 text-sm mt-1">{formErrors.price}</div>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Berat (gram)</label>
              <input 
                type="number" 
                name="weight" 
                value={form.weight} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                placeholder="Contoh: 500"
                min="0"
                step="0.01"
              />
              <div className="text-sm text-gray-600 mt-1">
                Berat produk dalam gram. Digunakan untuk perhitungan ongkir.
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Gambar Produk</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full border rounded px-3 py-2" multiple />
              <div className="text-xs text-gray-500 mt-1 mb-2">Urutkan gambar dengan drag & drop sesuai keinginan. Gambar pertama akan menjadi gambar utama.</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {/* Gambar dari backend */}
                {uploadedImages.map((img, idx) => (
                  <div key={img.image_id} className="relative">
                    <img src={`${(((typeof window !== 'undefined' && window.__API_URL__) || 
                                    process.env.REACT_APP_API_URL || 
                                    'https://1837c60c25d5.ngrok-free.app' ||
                                    'http://localhost:5000')).replace(/\/?api\/?$/i,'')}${img.url}?ngrok-skip-browser-warning=true`} alt={`Uploaded ${idx+1}`} className="h-24 rounded border-2 border-gray-200" />
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
               {/* Tentukan tipe kategori */}
               {(() => {
                 const catName = categories.find(c => c.category_id == form.category_id)?.category_name;
                 if (ACCESSORY_CATEGORIES.includes(catName)) {
                   // Untuk aksesoris, hanya input stok total (tanpa ukuran)
                   return (
                     <div className="flex gap-2 items-center mb-2">
                       <label className="text-sm font-medium">Stok Aksesoris:</label>
                       <input 
                         type="number" 
                         min="0" 
                         value={variants[0]?.stock_quantity || ''} 
                         onChange={e => setVariants([{ stock_quantity: e.target.value }])} 
                         className="border rounded px-2 py-1 w-24" 
                         placeholder="Stok" 
                       />
                       <span className="text-xs text-gray-500">(Akan dibuat barcode otomatis)</span>
                     </div>
                   );
                 }
                 const sizeOptions = SIZE_OPTIONS[catName];
                 if (!sizeOptions) {
                   return <div className="text-red-500 text-sm mb-2">Kategori tidak dikenali, silakan cek nama kategori!</div>;
                 }
                 return <>
                   {variants.map((v, idx) => (
                     <div key={idx} className="flex gap-2 items-center mb-2">
                       <select value={v.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} className="border rounded px-2 py-1">
                         <option value="">Pilih Ukuran</option>
                         {sizeOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                       <input type="number" min="0" value={v.stock_quantity} onChange={e => handleVariantChange(idx, 'stock_quantity', e.target.value)} className="border rounded px-2 py-1 w-24" placeholder="Stok" />
                       <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500">Hapus</button>
                     </div>
                   ))}
                   <button type="button" onClick={handleAddVariant} className="bg-blue-200 text-blue-800 px-3 py-1 rounded">Tambah Varian</button>
                 </>;
               })()}
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
      {/* Print satuan per varian */}
      {showPrintModal && productToPrint && (
        <div style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100vw', height: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PrintableBarcode product={productToPrint} />
        </div>
      )}
    </div>
  );
};

export default ManajemenProduk; 