import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useLoading } from "../context/LoadingContext";
import api from "../utils/api";

const Katalog = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [priceError, setPriceError] = useState("");

  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

  // Get search term from URL params
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);
        setCategories([{ category_id: 0, category_name: "Semua" }, ...catRes.data]);
        // Isi main_image_id jika kosong
        const enriched = await Promise.all((prodRes.data || []).map(async (p) => {
          if (!p.main_image_id) {
            try {
              const imgs = await api.get(`/products/${p.product_id}/images`);
              if (Array.isArray(imgs.data) && imgs.data.length > 0) {
                return { ...p, main_image_id: imgs.data[0].image_id };
              }
            } catch {}
          }
          return p;
        }));
        setProducts(enriched);
      } catch {
        setError("Gagal mengambil data katalog");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setIsLoading]);



  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory !== 0 && product.category_id !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        product.product_name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Price filter
    if (priceRange.min && product.price < Number(priceRange.min.replace(/\D/g, ''))) {
      return false;
    }
    if (priceRange.max && product.price > Number(priceRange.max.replace(/\D/g, ''))) {
      return false;
    }



    return true;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
    }
  };

  const validatePrice = (value, type) => {
    if (value === "") return true;
    
    // Hapus separator ribuan untuk validasi
    const cleanValue = value.replace(/\D/g, '');
    
    // Cek apakah input hanya angka
    if (!/^\d+$/.test(cleanValue)) {
      setPriceError(`${type === 'min' ? 'Harga minimum' : 'Harga maksimum'} hanya boleh berisi angka`);
      return false;
    }
    
    const numValue = Number(cleanValue);
    
    // Cek apakah minus
    if (numValue < 0) {
      setPriceError(`${type === 'min' ? 'Harga minimum' : 'Harga maksimum'} tidak boleh minus`);
      return false;
    }
    
    // Cek apakah kelipatan 10 ribu
    if (numValue % 10000 !== 0) {
      setPriceError(`${type === 'min' ? 'Harga minimum' : 'Harga maksimum'} harus kelipatan 10.000`);
      return false;
    }
    
    setPriceError("");
    return true;
  };

  const formatNumber = (value) => {
    // Hapus semua karakter non-digit
    const cleanValue = value.replace(/\D/g, '');
    
    // Format dengan separator ribuan
    if (cleanValue) {
      return parseInt(cleanValue).toLocaleString('id-ID');
    }
    return '';
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    
    // Format angka dengan separator ribuan
    const formattedValue = formatNumber(value);
    
    // Allow typing, validate on blur or when user finishes typing
    setPriceRange(prev => ({ ...prev, [type]: formattedValue }));
    
    // Clear error when user is typing
    if (priceError) {
      setPriceError("");
    }
  };

  const handlePriceBlur = (e, type) => {
    const value = e.target.value;
    validatePrice(value, type);
  };

  const clearFilters = () => {
    setSelectedCategory(0);
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setPriceError("");
    setSearchParams({});
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <section className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Compact Sidebar */}
        <aside className="lg:w-64 mb-4 lg:mb-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-800">Filter & Pencarian</h3>
            
            {/* Search - Compact */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter - Dropdown Menu */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Kategori</h4>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter - Compact */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Rentang Harga</h4>
              <div className="space-y-2">
                                 <input
                   type="text"
                   placeholder="Min (contoh: 50000)"
                   value={priceRange.min}
                   onChange={(e) => handlePriceChange(e, 'min')}
                   onBlur={(e) => handlePriceBlur(e, 'min')}
                   className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <input
                   type="text"
                   placeholder="Max (contoh: 100000)"
                   value={priceRange.max}
                   onChange={(e) => handlePriceChange(e, 'max')}
                   onBlur={(e) => handlePriceBlur(e, 'max')}
                   className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
              {/* Error Message */}
              {priceError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ {priceError}
                </div>
              )}
                             {/* Help Text */}
               <div className="mt-2 text-xs text-gray-500">
                 💡 Ketik manual: harga harus kelipatan 10.000 (contoh: 50000, 100000)
               </div>
            </div>



            {/* Clear Filters - Compact */}
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-3 py-1.5 text-xs rounded-md hover:bg-gray-600 transition"
            >
              Bersihkan Filter
            </button>
          </div>
        </aside>
        
        {/* Main Content - Products */}
        <main className="flex-1">
          {/* Search Results Header */}
          {searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-sm font-medium">Hasil pencarian:</span>
                  <span className="text-blue-800 font-semibold">"{searchTerm}"</span>
                </div>
                <span className="text-blue-600 text-xs">{filteredProducts.length} produk ditemukan</span>
              </div>
            </div>
          )}

          {/* Category Header */}
          {selectedCategory !== 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium">
                  Kategori: <span className="font-semibold">{categories.find(c => c.category_id === selectedCategory)?.category_name}</span>
                </span>
                <span className="text-gray-600 text-xs">{filteredProducts.length} produk</span>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <div key={product.product_id} onClick={() => navigate(`/produk/${product.product_id}`)} className="cursor-pointer">
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada produk ditemukan</h3>
              <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </main>
      </section>
      <Footer />
    </div>
  );
};

export default Katalog; 