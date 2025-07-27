import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../utils/api";
import Barcode from "react-barcode";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SIZE_OPTIONS = {
  'Celana': ["29", "30", "31", "32", "33", "34", "35", "36"],
  'Kemeja': ["S", "M", "L", "XL", "XXL"],
  'Kaos': ["S", "M", "L", "XL", "XXL"],
  'Jaket': ["S", "M", "L", "XL", "XXL"],
  'Celana Pendek': ["29", "30", "31", "32", "33", "34", "35", "36"],
  'Celana Panjang': ["29", "30", "31", "32", "33", "34", "35", "36"],
};
const ACCESSORY_CATEGORIES = ["Aksesoris"];

// KATEGORI PAKAIAN ATAS DAN BAWAH
const TOP_CATEGORIES = ["Kaos", "Kemeja", "Jaket"];
const BOTTOM_CATEGORIES = ["Celana", "Celana Pendek", "Celana Panjang", "Sandal"];

function formatRupiah(num) {
  if (!num && num !== 0) return "";
  return "Rp" + Number(num).toLocaleString("id-ID");
}

const PrintableBarcode = React.forwardRef(({ product }, ref) => {
  if (!product) return null;
  return (
    <div ref={ref} className="printable-area">
      <style>{`@media print { body * { visibility: hidden; } .printable-area, .printable-area * { visibility: visible; } .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; } .barcode-container { text-align: center; border: 1px solid #ccc; padding: 20px; } }`}</style>
      <div className="barcode-container">
        <h4>{product.product_name}</h4>
        <p>{formatRupiah(product.price)}</p>
        <Barcode value={product.product_id.toString()} />
      </div>
    </div>
  );
});

function getSizeOptions(categoryName) {
  if (TOP_CATEGORIES.includes(categoryName)) return ["S", "M", "L", "XL", "XXL"];
  if (BOTTOM_CATEGORIES.includes(categoryName)) return ["29", "30", "31", "32", "33", "34", "35", "36"];
  return null;
}

const ManajemenBarang = () => {
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
  const [oldImages, setOldImages] = useState([]);

  const handlePrint = (product) => {
    setProductToPrint(product);
  };

  useEffect(() => {
    if (productToPrint) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      setProductToPrint(null);
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
    console.log('HANDLE EDIT DIPANGGIL', prod);
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
    api.get(`/products/${prod.product_id}`)
      .then(res => {
        console.log('API RESPONSE:', res.data);
        setVariants(res.data.variants || []);
        setOldImages(res.data.images || []);
        console.log('SET OLD IMAGES:', res.data.images);
      })
      .catch(err => {
        console.error('API ERROR:', err);
        setError('Gagal mengambil detail produk: ' + (err.response?.data?.message || err.message));
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

  const handleDeleteOldImage = async (imageId) => {
    if (!window.confirm('Hapus gambar ini?')) return;
    try {
      await api.delete(`/products/images/${imageId}`);
      setOldImages(oldImages.filter(img => img.image_id !== imageId));
      toast.success('Gambar berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus gambar');
    }
  };

  const handleDeleteNewImage = (idx) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
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
          const res = await api.post(`/products/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err) {
          setError("Upload gambar gagal: " + (err.response?.data?.message || err.message));
          toast.error("Upload gambar gagal: " + (err.response?.data?.message || err.message));
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

  // Tambahkan log render
  useEffect(() => {
    console.log('RENDER oldImages:', oldImages);
  }, [oldImages]);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Manajemen Barang</h2>
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
        <button onClick={handleAdd} className="mb-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Tambah Produk</button>
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th className="text-left">Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok Total</th>
              <th>Gambar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((prod) => (
              <tr key={prod.product_id}>
                <td>{prod.product_name}</td>
                <td>{categories.find((c) => c.category_id === prod.category_id)?.category_name || '-'}</td>
                <td>{formatRupiah(prod.price)}</td>
                <td>{prod.total_stock}</td>
                <td>
                  {prod.main_image_id ? (
                    <img src={`http://localhost:5000/api/products/images/${prod.main_image_id}`} alt={prod.product_name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </td>
                <td className="flex gap-2 items-center">
                  <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(prod.product_id)} className="text-red-500 hover:underline">Hapus</button>
                  <button onClick={() => handlePrint(prod)} className="text-green-600 hover:underline">Cetak Barcode</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'none' }}>
            <PrintableBarcode ref={printRef} product={productToPrint} />
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
                {oldImages && oldImages.length > 0 && oldImages.map((img, idx) => (
                  <div key={img.image_id} className="relative group">
                    <img src={img.url || `http://localhost:5000/api/products/images/${img.image_id}`} alt={`Gambar ${idx+1}`} className="h-24 rounded border-2 border-gray-200" />
                    <button type="button" onClick={() => handleDeleteOldImage(img.image_id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs opacity-80 group-hover:opacity-100">Hapus</button>
                  </div>
                ))}
                {imagePreviews.map(({src}, idx) => (
                  <div key={src} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${idx+1}`}
                      className={`h-24 cursor-move rounded border-2 ${draggedIdx === idx ? 'border-blue-500' : 'border-gray-200'}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      title="Drag untuk mengurutkan"
                    />
                    <button type="button" onClick={() => handleDeleteNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs opacity-80 group-hover:opacity-100">Hapus</button>
                  </div>
                ))}
                {(!oldImages || oldImages.length === 0) && imagePreviews.length === 0 && (
                  <div className="text-gray-400 text-sm">Belum ada gambar produk yang diupload.</div>
                )}
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
                      <input type="number" min="0" value={variants[0]?.stock_quantity || ''} onChange={e => setVariants([{ stock_quantity: e.target.value }])} className="border rounded px-2 py-1 w-24" placeholder="Stok" />
                    </div>
                  );
                }
                const sizeOptions = getSizeOptions(catName);
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
    </div>
  );
};

export default ManajemenBarang; 