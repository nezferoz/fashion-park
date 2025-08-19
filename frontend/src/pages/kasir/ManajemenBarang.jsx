import React, { useCallback, useEffect, useRef, useState } from "react";
// Remove problematic imports and use simpler alternatives
import api from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";
import JsBarcode from 'jsbarcode';

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

// Simplified barcode component without external dependency
const PrintableBarcode = React.forwardRef(({ product }, ref) => {
  if (!product) return null;
  
  // Generate barcode when component mounts
  useEffect(() => {
    if (product && ref.current) {
      const svg = ref.current.querySelector('.barcode-svg');
      if (svg) {
        try {
          // Gunakan barcode dari variant pertama jika ada, atau product_id sebagai fallback
          const barcodeValue = product.variants && product.variants.length > 0 
            ? (product.variants[0].barcode || product.variants[0].variant_id)
            : product.product_id;
          
          JsBarcode(svg, barcodeValue, {
            format: "CODE128",
            width: 1,
            height: 20,
            displayValue: false,
            margin: 0
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      }
    }
  }, [product]);

  return (
    <div ref={ref} className="printable-area">
      <style>{`@media print { 
        body * { visibility: hidden; } 
        .printable-area, .printable-area * { visibility: visible; } 
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
          padding: 5px; 
          width: 2cm; 
          height: 1.5cm; 
          font-size: 6px !important;
        } 
        .barcode-svg { width: 100% !important; height: 20px !important; }
      }`}</style>
      <div className="barcode-container">
        <div style={{fontSize: '6px', fontWeight: 'bold', marginBottom: '3px', lineHeight: '1.2'}}>
          {(() => {
            const words = product.product_name.split(' ');
            return words.slice(0, 3).join(' ');
          })()}
        </div>
        <div style={{fontSize: '5px', color: '#666', marginBottom: '3px'}}>
          {formatRupiah(product.price)}
        </div>
        {product.variants && product.variants.length > 0 && (
          <div style={{fontSize: '5px', color: '#333', marginBottom: '2px', fontWeight: 'bold'}}>
            Size: {product.variants[0].size}
          </div>
        )}
        <svg className="barcode-svg" style={{width: '100%', height: '20px', margin: '3px 0'}}></svg>
        <div className="barcode-text" style={{fontFamily: 'monospace', fontSize: '6px', fontWeight: 'bold', lineHeight: '1.2'}}>
          {product.variants && product.variants.length > 0 
            ? (product.variants[0].barcode || product.variants[0].variant_id)
            : product.product_id
          }
        </div>
      </div>
    </div>
  );
});

function getSizeOptions(categoryName) {
  if (TOP_CATEGORIES.includes(categoryName)) return ["S", "M", "L", "XL", "XXL"];
  if (BOTTOM_CATEGORIES.includes(categoryName)) return ["29", "30", "31", "32", "33", "34", "35", "36"];
  return null;
}

// Simple notification system without external dependency
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
};

const ManajemenBarang = () => {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_name: "", price: "", category_id: "", description: "", weight: "" });
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handlePrint = (product) => {
    if (!product || !product.product_id) {
      showNotification('Data produk tidak valid untuk print', 'error');
      return;
    }
    setProductToPrint(product);
  };

  // Handle multiple product selection
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      // Gunakan produk yang sudah difilter
      const currentProducts = produk.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || product.category_id == filterCategory;
        return matchesSearch && matchesCategory;
      });
      const allProductIds = currentProducts.map(p => p.product_id);
      setSelectedProducts(allProductIds);
      setSelectAll(true);
    }
  };

  const handlePrintSelected = () => {
    if (selectedProducts.length === 0) {
      showNotification('Pilih produk terlebih dahulu untuk dicetak', 'warning');
      return;
    }
    
    const selectedProds = filteredProducts.filter(p => selectedProducts.includes(p.product_id));
    if (selectedProds.length > 0) {
      // Print multiple products dengan barcode per variant (ukuran)
      let printContents = '';
      
      selectedProds.forEach(product => {
        if (product.variants && product.variants.length > 0) {
          // Print setiap variant (ukuran) dengan barcode unik
          product.variants.forEach(variant => {
            const words = product.product_name.split(' ');
            const shortName = words.slice(0, 3).join(' ');
            
            printContents += `
              <div class="barcode-item" style="page-break-after: always; text-align: center; padding: 5px; border: 1px solid #ccc; margin: 5px; width: 2cm; height: 1.5cm; display: inline-block; vertical-align: top;">
                <div style="font-size: 6px; font-weight: bold; margin-bottom: 3px; line-height: 1.2;">${shortName}</div>
                <div style="font-size: 5px; color: #666; margin-bottom: 2px;">${formatRupiah(product.price)}</div>
                <div style="font-size: 5px; color: #333; margin-bottom: 2px; font-weight: bold;">Size: ${variant.size}</div>
                <svg class="barcode" data-barcode="${variant.barcode || variant.variant_id}" style="width: 100%; height: 20px; margin: 2px 0;"></svg>
                <div class="barcode-text" style="font-family: monospace; font-size: 6px; font-weight: bold; line-height: 1.2;">${variant.barcode || variant.variant_id}</div>
              </div>
            `;
          });
        } else {
          // Fallback jika tidak ada variant
          const words = product.product_name.split(' ');
          const shortName = words.slice(0, 3).join(' ');
          
          printContents += `
            <div class="barcode-item" style="page-break-after: always; text-align: center; padding: 5px; border: 1px solid #ccc; margin: 5px; width: 2cm; height: 1.5cm; display: inline-block; vertical-align: top;">
              <div style="font-size: 6px; font-weight: bold; margin-bottom: 3px; line-height: 1.2;">${shortName}</div>
              <div style="font-size: 5px; color: #666; margin-bottom: 2px;">${formatRupiah(product.price)}</div>
              <div style="font-size: 5px; color: #333; margin-bottom: 2px; font-weight: bold;">No Size</div>
              <svg class="barcode" data-barcode="${product.product_id}" style="width: 100%; height: 20px; margin: 2px 0;"></svg>
              <div class="barcode-text" style="font-family: monospace; font-size: 6px; font-weight: bold; line-height: 1.2;">${product.product_id}</div>
            </div>
          `;
        }
      });
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode - ${selectedProds.length} Produk</title>
            <style>
              @media print {
                .barcode-item { 
                  page-break-after: always; 
                  width: 2cm !important;
                  height: 1.5cm !important;
                  font-size: 6px !important;
                }
                .barcode-item:last-child { page-break-after: avoid; }
                body { margin: 0; padding: 10px; }
                .barcode { width: 100% !important; height: 20px !important; }
              }
            </style>
          </head>
          <body>
            ${printContents}
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
              window.onload = function() {
                // Generate barcode untuk setiap SVG
                document.querySelectorAll('.barcode').forEach(function(svg) {
                  const barcodeValue = svg.getAttribute('data-barcode');
                  JsBarcode(svg, barcodeValue, {
                    format: "CODE128",
                    width: 1,
                    height: 20,
                    displayValue: false,
                    margin: 0
                  });
                });
                // Tunggu sebentar agar barcode ter-generate, lalu print
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      showNotification(`${selectedProds.length} barcode berhasil diprint`, 'success');
    }
  };

  const handlePrintAll = () => {
    if (filteredProducts.length === 0) {
      showNotification('Tidak ada produk untuk dicetak', 'warning');
      return;
    }
    
    let printContents = '';
    
    filteredProducts.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        // Print setiap variant (ukuran) dengan barcode unik
        product.variants.forEach(variant => {
          const words = product.product_name.split(' ');
          const shortName = words.slice(0, 3).join(' ');
          
          printContents += `
            <div class="barcode-item" style="page-break-after: always; text-align: center; padding: 5px; border: 1px solid #ccc; margin: 5px; width: 2cm; height: 1.5cm; display: inline-block; vertical-align: top;">
              <div style="font-size: 6px; font-weight: bold; margin-bottom: 3px; line-height: 1.2;">${shortName}</div>
              <div style="font-size: 5px; color: #666; margin-bottom: 2px;">${formatRupiah(product.price)}</div>
              <div style="font-size: 5px; color: #333; margin-bottom: 2px; font-weight: bold;">Size: ${variant.size}</div>
              <svg class="barcode" data-barcode="${variant.barcode || variant.variant_id}" style="width: 100%; height: 20px; margin: 2px 0;"></svg>
              <div class="barcode-text" style="font-family: monospace; font-size: 6px; font-weight: bold; line-height: 1.2;">${variant.barcode || variant.variant_id}</div>
            </div>
          `;
        });
      } else {
        // Fallback jika tidak ada variant
        const words = product.product_name.split(' ');
        const shortName = words.slice(0, 3).join(' ');
        
        printContents += `
          <div class="barcode-item" style="page-break-after: always; text-align: center; padding: 5px; border: 1px solid #ccc; margin: 5px; width: 2cm; height: 1.5cm; display: inline-block; vertical-align: top;">
            <div style="font-size: 6px; font-weight: bold; margin-bottom: 3px; line-height: 1.2;">${shortName}</div>
            <div style="font-size: 5px; color: #666; margin-bottom: 2px;">${formatRupiah(product.price)}</div>
            <div style="font-size: 5px; color: #333; margin-bottom: 2px; font-weight: bold;">No Size</div>
            <svg class="barcode" data-barcode="${product.product_id}" style="width: 100%; height: 20px; margin: 2px 0;"></svg>
            <div class="barcode-text" style="font-family: monospace; font-size: 6px; font-weight: bold; line-height: 1.2;">${product.product_id}</div>
          </div>
        `;
      }
    });
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - Semua Produk</title>
          <style>
            @media print {
              .barcode-item { 
                page-break-after: always; 
                width: 2cm !important;
                height: 1.5cm !important;
                font-size: 6px !important;
              }
              .barcode-item:last-child { page-break-after: avoid; }
              body { margin: 0; padding: 10px; }
              .barcode { width: 100% !important; height: 20px !important; }
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              // Generate barcode untuk setiap SVG
              document.querySelectorAll('.barcode').forEach(function(svg) {
                const barcodeValue = svg.getAttribute('data-barcode');
                JsBarcode(svg, barcodeValue, {
                  format: "CODE128",
                  width: 1,
                  height: 20,
                  displayValue: false,
                  margin: 0
                });
              });
              // Tunggu sebentar agar barcode ter-generate, lalu print
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    showNotification(`${filteredProducts.length} barcode berhasil diprint`, 'success');
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      showNotification('Pilih produk terlebih dahulu untuk dihapus', 'warning');
      return;
    }
    
    const confirmDelete = window.confirm(`Yakin hapus ${selectedProducts.length} produk yang dipilih?`);
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const deletePromises = selectedProducts.map(id => api.delete(`/products/${id}`));
      await Promise.all(deletePromises);
      
      setSuccess(`${selectedProducts.length} produk berhasil dihapus`);
      showNotification(`${selectedProducts.length} produk berhasil dihapus`, 'success');
      setSelectedProducts([]);
      setSelectAll(false);
      await fetchProduk();
    } catch (err) {
      const errorMsg = `Gagal menghapus ${selectedProducts.length} produk: ` + (err.response?.data?.message || err.message);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productToPrint && printRef.current) {
      try {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        setProductToPrint(null);
        showNotification('Barcode berhasil diprint', 'success');
      } catch (err) {
        console.error('Print error:', err);
        showNotification('Gagal print barcode', 'error');
        setProductToPrint(null);
      }
    }
  }, [productToPrint]);

  const fetchProduk = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products");
      setProduk(res.data);
    } catch (err) {
      const errorMsg = "Gagal mengambil data produk: " + (err.response?.data?.message || err.message);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Gagal mengambil data kategori');
    }
  };

  useEffect(() => {
    fetchProduk();
    fetchCategories();
  }, []);

  // Filter products - pindahkan ke atas sebelum digunakan
  const filteredProducts = produk.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category_id == filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Update selectAll based on selectedProducts
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every(p => selectedProducts.includes(p.product_id));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, filteredProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate input based on field type
    if (name === 'price') {
      // Remove non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, '');
      setForm(prevForm => ({ ...prevForm, [name]: cleanValue }));
    } else if (name === 'weight') {
      // Only allow positive numbers for weight
      const numValue = value === '' ? '' : Math.max(0, Number(value));
      setForm(prevForm => ({ ...prevForm, [name]: numValue }));
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }
    
    // Reset variants when category changes
    if (name === 'category_id') {
      setVariants([]);
      setFormErrors(prev => ({ ...prev, variants: undefined }));
    }
    
    // Clear form errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Reset selection when search or filter changes
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [searchTerm, filterCategory]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate file types
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          showNotification('File harus berupa gambar', 'warning');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showNotification('Ukuran file maksimal 5MB', 'warning');
          return false;
        }
        return true;
      });
      
      setImagePreviews(validFiles.map(file => ({ src: URL.createObjectURL(file), file })));
    } else {
      setImagePreviews([]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    if (variants.length >= 10) {
      showNotification('Maksimal 10 varian per produk', 'warning');
      return;
    }
    setVariants(prevVariants => [...prevVariants, { size: '', stock_quantity: 0, variant_id: null }]);
  };

  const handleVariantChange = (idx, field, value) => {
    if (idx < 0 || idx >= variants.length) {
      console.error('Invalid variant index:', idx);
      return;
    }
    
    setVariants(prevVariants => 
      prevVariants.map((v, i) => 
        i === idx ? { ...v, [field]: value } : v
      )
    );
  };

  const handleRemoveVariant = (idx) => {
    if (idx < 0 || idx >= variants.length) {
      console.error('Invalid variant index:', idx);
      return;
    }
    
    if (variants.length <= 1) {
      showNotification('Minimal harus ada 1 varian', 'warning');
      return;
    }
    
    setVariants(prevVariants => prevVariants.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setForm({ product_name: "", price: "", category_id: "", description: "", weight: "" });
    setEditId(null);
    setShowForm(true);
    setSuccess("");
    setError("");
    setVariants([]);
    setOldImages([]);
    setImagePreviews([]);
    setFormErrors({});
    // Reset selection when opening form
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleEdit = (prod) => {
    console.log('HANDLE EDIT DIPANGGIL', prod);
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
    setFormErrors({});
    // Reset selection when editing
    setSelectedProducts([]);
    setSelectAll(false);
    
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
      showNotification("Produk berhasil dihapus", 'success');
      // Remove from selection if it was selected
      setSelectedProducts(prev => prev.filter(pid => pid !== id));
      fetchProduk();
    } catch (err) {
      const errorMsg = "Gagal menghapus produk: " + (err.response?.data?.message || err.message);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    }
  };

  const handleDeleteOldImage = async (imageId) => {
    if (!window.confirm('Hapus gambar ini?')) return;
    try {
      await api.delete(`/products/images/${imageId}`);
      setOldImages(prevImages => prevImages.filter(img => img.image_id !== imageId));
      showNotification('Gambar berhasil dihapus', 'success');
    } catch (err) {
      const errorMsg = 'Gagal menghapus gambar: ' + (err.response?.data?.message || err.message);
      showNotification(errorMsg, 'error');
    }
  };

  const handleDeleteNewImage = (idx) => {
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.product_name) errors.product_name = 'Nama produk wajib diisi';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Harga harus lebih dari 0';
    if (!form.category_id) errors.category_id = 'Kategori wajib dipilih';
    
    const catName = categories.find(c => c.category_id == form.category_id)?.category_name;
    if (ACCESSORY_CATEGORIES.includes(catName)) {
      // Untuk aksesoris, pastikan ada input stok
      if (!variants || variants.length === 0 || !variants[0]?.stock_quantity || Number(variants[0].stock_quantity) < 0) {
        errors.variants = 'Stok aksesoris wajib diisi';
      }
    } else {
      // Untuk produk dengan ukuran, pastikan ada varian
      if (!variants || variants.length === 0) {
        errors.variants = 'Minimal 1 varian wajib diisi';
      } else {
        // Validasi setiap varian
        for (let i = 0; i < variants.length; i++) {
          if (!variants[i].size) {
            errors.variants = `Ukuran untuk varian ${i + 1} wajib dipilih`;
            break;
          }
          if (!variants[i].stock_quantity || Number(variants[i].stock_quantity) < 0) {
            errors.variants = `Stok untuk varian ${i + 1} wajib diisi`;
            break;
          }
        }
      }
    }
    
    if (!editId && (!imagePreviews || imagePreviews.length === 0)) {
      errors.image = 'Minimal 1 gambar produk wajib diupload';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormErrors({});
    setLoadingSubmit(true);
    
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoadingSubmit(false);
        return;
      }
      
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
        showNotification("Produk berhasil diupdate", 'success');
        productId = editId;
      } else {
        const res = await api.post("/products", formToSend);
        productId = res.data.product_id || res.data.id;
        setSuccess("Produk berhasil ditambah");
        showNotification("Produk berhasil ditambah", 'success');
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
            // Use the correct endpoint for updating variants
            await api.put(`/products/${productId}/variants/${v.variant_id}`, { size: v.size, stock_quantity: Number(v.stock_quantity) });
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
          showNotification("Upload gambar gagal: " + (err.response?.data?.message || err.message), 'error');
        }
      }
      setShowForm(false);
      await fetchProduk();
      setImagePreviews([]);
      setForm({ product_name: "", price: "", category_id: "", description: "", weight: "" });
      setVariants([]);
      setOldImages([]);
      setFormErrors({});
      // Reset selection after successful submit
      setSelectedProducts([]);
      setSelectAll(false);
    } catch (err) {
      const errorMsg = "Gagal menyimpan produk: " + (err.response?.data?.message || err.message);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    }
    setLoadingSubmit(false);
  };



  // Stock status functions
  const getStockStatusText = (stock) => {
    if (stock === 0) return "Habis";
    if (stock <= 10) return "Rendah";
    return "Tersedia";
  };

  const getStockStatusClass = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Tambahkan log render
  useEffect(() => {
    console.log('RENDER oldImages:', oldImages);
  }, [oldImages]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Manajemen Barang & Stok</h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data produk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 flex-1">
      <div className="bg-white rounded-xl shadow p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6">Manajemen Barang & Stok</h2>
        {success && <div className="bg-green-100 text-green-700 p-2 sm:p-3 rounded mb-3 sm:mb-4 text-center text-xs sm:text-sm">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-3 sm:mb-4 text-center text-xs sm:text-sm">{error}</div>}
        
        {/* Selection Info */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-blue-600 text-base sm:text-lg">✓</span>
                <span className="text-blue-800 font-medium text-sm sm:text-base">
                  {selectedProducts.length} produk dipilih dari {filteredProducts.length} produk
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedProducts([]);
                  setSelectAll(false);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm underline self-start sm:self-auto"
              >
                Hapus Seleksi
              </button>
            </div>
          </div>
        )}
        
        {/* Stock Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
          <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="text-blue-600 text-lg sm:text-xl lg:text-2xl mr-2 sm:mr-3">📦</div>
              <div>
                <p className="text-blue-800 font-semibold text-xs sm:text-sm">Total Produk</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-900">{produk.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="text-green-600 text-lg sm:text-xl lg:text-2xl mr-2 sm:mr-3">✅</div>
              <div>
                <p className="text-green-800 font-semibold text-xs sm:text-sm">Stok Tersedia</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-green-900">
                  {produk.filter(p => (p.total_stock || 0) > 10).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="text-yellow-600 text-lg sm:text-xl lg:text-2xl mr-2 sm:mr-3">⚠️</div>
              <div>
                <p className="text-yellow-800 font-semibold text-xs sm:text-sm">Stok Rendah</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-yellow-900">
                  {produk.filter(p => (p.total_stock || 0) <= 10 && (p.total_stock || 0) > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <div className="text-red-600 text-lg sm:text-xl lg:text-2xl mr-2 sm:mr-3">❌</div>
              <div>
                <p className="text-red-800 font-semibold text-xs sm:text-sm">Stok Habis</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-red-900">
                  {produk.filter(p => (p.total_stock || 0) === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
          <button 
            onClick={handleAdd} 
            className="bg-blue-600 text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
          >
            <span className="text-sm sm:text-base lg:text-lg">➕</span>
            <span className="hidden sm:inline">Tambah Produk</span>
            <span className="sm:hidden">Tambah</span>
          </button>
          
          {selectedProducts.length > 0 && (
            <>
              <button 
                onClick={handlePrintSelected}
                className="bg-green-600 text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
                title={`Cetak barcode untuk ${selectedProducts.length} produk yang dipilih`}
              >
                <span className="text-sm sm:text-base lg:text-lg">🖨️</span>
                <span className="hidden lg:inline">Cetak Barcode ({selectedProducts.length} Produk)</span>
                <span className="hidden sm:inline lg:hidden">Cetak ({selectedProducts.length})</span>
                <span className="sm:hidden">Cetak</span>
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
                title={`Hapus ${selectedProducts.length} produk yang dipilih`}
              >
                <span className="text-sm sm:text-base lg:text-lg">🗑️</span>
                <span className="hidden lg:inline">Hapus ({selectedProducts.length} Produk)</span>
                <span className="hidden sm:inline lg:hidden">Hapus ({selectedProducts.length})</span>
                <span className="sm:hidden">Hapus</span>
              </button>
            </>
          )}
          
          {filteredProducts.length > 0 && (
            <button 
              onClick={handlePrintAll}
              className="bg-purple-600 text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
              title={`Cetak barcode untuk semua ${filteredProducts.length} produk`}
            >
              <span className="text-sm sm:text-base lg:text-lg">🖨️</span>
              <span className="hidden lg:inline">Cetak Semua Barcode ({filteredProducts.length} Produk)</span>
              <span className="hidden sm:inline lg:hidden">Cetak Semua ({filteredProducts.length})</span>
              <span className="sm:hidden">Cetak Semua</span>
            </button>
          )}
        </div>
        
        {/* Search and Filter */}
        <div className="mb-3 sm:mb-4 lg:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm lg:text-base"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 sm:px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm lg:text-base"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2 sm:p-3 lg:p-4">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">Nama Produk</th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden sm:table-cell">Kategori</th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden lg:table-cell">Harga</th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden xl:table-cell">Berat</th>
                  <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">Stok Total</th>
                  <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden sm:table-cell">Status Stok</th>
                  <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700 hidden md:table-cell">Gambar</th>
                  <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((prod) => (
                  <tr key={prod.product_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-2 sm:p-3 lg:p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod.product_id)}
                        onChange={() => handleProductSelect(prod.product_id)}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                          {prod.product_name}
                        </p>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {prod.category_name} • {formatRupiah(prod.price)}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm text-gray-600">{prod.category_name}</span>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 hidden lg:table-cell">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">{formatRupiah(prod.price)}</span>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 hidden xl:table-cell">
                      <span className="text-xs sm:text-sm text-gray-600">{prod.weight}g</span>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (prod.total_stock || 0) > 10 ? 'bg-green-100 text-green-800' :
                        (prod.total_stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prod.total_stock || 0}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (prod.total_stock || 0) > 10 ? 'bg-green-100 text-green-800' :
                        (prod.total_stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(prod.total_stock || 0) > 10 ? 'Tersedia' : (prod.total_stock || 0) > 0 ? 'Rendah' : 'Habis'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 text-center hidden md:table-cell">
                      {prod.main_image_id ? (
                        <img
                          src={getImageUrl(prod.main_image_id)}
                          alt={prod.product_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 text-center">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="bg-blue-500 text-white p-1 sm:p-2 rounded text-xs hover:bg-blue-600 transition-colors"
                          title="Edit Produk"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handlePrint(prod)}
                          className="bg-green-500 text-white p-1 sm:p-2 rounded text-xs hover:bg-green-600 transition-colors"
                          title="Print Barcode"
                        >
                          🖨️
                        </button>
                        <button
                          onClick={() => handleDelete(prod.product_id)}
                          className="bg-red-500 text-white p-1 sm:p-2 rounded text-xs hover:bg-red-600 transition-colors"
                          title="Hapus Produk"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ display: 'none' }}>
            <PrintableBarcode ref={printRef} product={productToPrint} />
        </div>
                 {showForm && (
           <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6">
             <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
               {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
             </h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <div>
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Nama Produk</label>
                 <input 
                   type="text" 
                   name="product_name" 
                   value={form.product_name} 
                   onChange={handleChange} 
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   required 
                   placeholder="Masukkan nama produk"
                 />
                 {formErrors.product_name && <div className="text-red-500 text-xs sm:text-sm mt-2">{formErrors.product_name}</div>}
               </div>
               
               <div>
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Kategori</label>
                 <select 
                   name="category_id" 
                   value={form.category_id} 
                   onChange={handleChange} 
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   required
                 >
                   <option value="">Pilih Kategori</option>
                   {categories.map((cat) => (
                     <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                   ))}
                 </select>
                 {formErrors.category_id && <div className="text-red-500 text-xs sm:text-sm mt-2">{formErrors.category_id}</div>}
               </div>
               
               <div>
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Harga</label>
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
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   required 
                   placeholder="Contoh: 1.230.000"
                 />
                 {formErrors.price && <div className="text-red-500 text-xs sm:text-sm mt-2">{formErrors.price}</div>}
               </div>
               
               <div>
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Berat (gram)</label>
                 <input 
                   type="number" 
                   name="weight" 
                   value={form.weight} 
                   onChange={handleChange} 
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   placeholder="Contoh: 500"
                   min="0"
                   step="0.01"
                 />
                 <div className="text-xs sm:text-sm text-gray-500 mt-2">
                   Berat produk dalam gram. Digunakan untuk perhitungan ongkir.
                 </div>
               </div>
               
               <div className="sm:col-span-2">
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Deskripsi</label>
                 <textarea 
                   name="description" 
                   value={form.description} 
                   onChange={handleChange} 
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   rows="3"
                   placeholder="Masukkan deskripsi produk (opsional)"
                 />
               </div>
               
               <div className="sm:col-span-2">
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Gambar Produk</label>
                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef} 
                   onChange={handleImageChange} 
                   className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base" 
                   multiple 
                 />
                 <div className="text-xs text-gray-500 mt-2 mb-3">Urutkan gambar dengan drag & drop sesuai keinginan. Gambar pertama akan menjadi gambar utama.</div>
                 
                 <div className="flex gap-2 sm:gap-3 flex-wrap">
                   {oldImages.map((img, idx) => (
                     <div key={img.image_id} className="relative group">
                       <img
                         src={getImageUrl(img.image_id)}
                         alt={`Gambar ${idx+1}`}
                         className={`h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-cover rounded-lg border-2 cursor-move shadow-sm transition-all ${
                           draggedIdx === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                         }`}
                         draggable
                         onDragStart={() => handleDragStart(idx)}
                         onDragOver={e => handleDragOver(e, idx)}
                         onDragEnd={handleDragEnd}
                         title="Drag untuk mengurutkan"
                       />
                       <button 
                         type="button" 
                         onClick={() => handleDeleteOldImage(img.image_id)} 
                         className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                       >
                         ×
                       </button>
                     </div>
                   ))}
                   
                   {imagePreviews.map(({src}, idx) => (
                     <div key={src} className="relative group">
                       <img
                         src={src}
                         alt={`Preview ${idx+1}`}
                         className={`h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-cover rounded-lg border-2 cursor-move shadow-sm transition-all ${
                           draggedIdx === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                         }`}
                         draggable
                         onDragStart={() => handleDragStart(idx)}
                         onDragOver={e => handleDragOver(e, idx)}
                         onDragEnd={handleDragEnd}
                         title="Drag untuk mengurutkan"
                       />
                       <button 
                         type="button" 
                         onClick={() => handleDeleteNewImage(idx)} 
                         className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                       >
                         ×
                       </button>
                     </div>
                   ))}
                   
                   {(!oldImages || oldImages.length === 0) && imagePreviews.length === 0 && (
                     <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                       <span className="text-gray-400 text-xs text-center">No Image</span>
                     </div>
                   )}
                 </div>
                 
                 {formErrors.image && <div className="text-red-500 text-xs sm:text-sm mt-2">{formErrors.image}</div>}
               </div>
               <div className="sm:col-span-2">
                 <label className="block font-semibold text-gray-700 mb-2 text-sm sm:text-base">Varian Ukuran & Stok</label>
                 {/* Tentukan tipe kategori */}
                 {(() => {
                   const catName = categories.find(c => c.category_id == form.category_id)?.category_name;
                   if (ACCESSORY_CATEGORIES.includes(catName)) {
                     // Untuk aksesoris, hanya input stok total (tanpa ukuran)
                     return (
                       <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                         <label className="text-xs sm:text-sm font-medium text-gray-700">Stok Aksesoris:</label>
                         <input 
                           type="number" 
                           min="0" 
                           value={variants[0]?.stock_quantity || ''} 
                           onChange={e => {
                             const newVariants = [{ stock_quantity: e.target.value, size: '' }];
                             setVariants(newVariants);
                           }} 
                           className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" 
                           placeholder="Stok" 
                         />
                         <span className="text-xs text-gray-500">(Akan dibuat barcode otomatis)</span>
                       </div>
                     );
                   }
                   
                   const sizeOptions = getSizeOptions(catName);
                   if (!sizeOptions) {
                     return <div className="text-red-500 text-xs sm:text-sm p-3 bg-red-50 border border-red-200 rounded-lg">Kategori tidak dikenali, silakan cek nama kategori!</div>;
                   }
                   
                   return (
                     <div className="space-y-3">
                       {variants.map((v, idx) => (
                         <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                           <select 
                             value={v.size || ''} 
                             onChange={e => handleVariantChange(idx, 'size', e.target.value)} 
                             className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                           >
                             <option value="">Pilih Ukuran</option>
                             {sizeOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                           <input 
                             type="number" 
                             min="0" 
                             value={v.stock_quantity || ''} 
                             onChange={e => handleVariantChange(idx, 'stock_quantity', e.target.value)} 
                             className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" 
                             placeholder="Stok" 
                           />
                           <button 
                             type="button" 
                             onClick={() => handleRemoveVariant(idx)} 
                             className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm sm:text-base"
                           >
                             Hapus
                           </button>
                         </div>
                       ))}
                       <button 
                         type="button" 
                         onClick={handleAddVariant} 
                         className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200 text-sm sm:text-base"
                       >
                         ➕ Tambah Varian
                       </button>
                     </div>
                   );
                 })()}
                 {formErrors.variants && <div className="text-red-500 text-xs sm:text-sm mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">{formErrors.variants}</div>}
               </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
               <button 
                 type="submit" 
                 className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
                 disabled={loadingSubmit}
               >
                 {loadingSubmit ? (
                   <span className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                     Menyimpan...
                   </span>
                 ) : (
                   'Simpan Produk'
                 )}
               </button>
               
               <button 
                 type="button" 
                 onClick={() => { 
                   setShowForm(false); 
                   setFormErrors({}); 
                   setImagePreviews([]); 
                   setDraggedIdx(null);
                   setVariants([]);
                   setOldImages([]);
                   // Reset selection when closing form
                   setSelectedProducts([]);
                   setSelectAll(false);
                 }} 
                 className="bg-gray-200 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-md hover:shadow-lg text-sm sm:text-base" 
                 disabled={loadingSubmit}
               >
                 Batal
               </button>
             </div>
          </form>
        )}
      </div>
      <div style={{ position: 'fixed', zIndex: 9999, right: 20, top: 20 }}>
        {/* ToastContainer is removed as per the new_code, but the notification system is still in place. */}
      </div>
    </div>
  );
};

export default ManajemenBarang; 