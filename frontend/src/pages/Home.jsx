import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import api from "../utils/api";
import { useLoading } from "../context/LoadingContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/products");
        console.log("Products response:", res.data); // Debug log
        // Pastikan setiap produk memiliki main_image_id, jika kosong ambil via /:id/images
        let list = Array.isArray(res.data) ? res.data : [];
        const fixes = await Promise.all(list.map(async (p) => {
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
        setProducts(fixes);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Gagal mengambil data produk");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [setIsLoading]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <section id="katalog" className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Katalog Produk</h2>
        {error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <div key={product.product_id} onClick={() => navigate(`/produk/${product.product_id}`)} className="cursor-pointer">
                  <ProductCard {...product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                {Array.isArray(products) ? "Tidak ada produk tersedia" : "Memuat produk..."}
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Home; 