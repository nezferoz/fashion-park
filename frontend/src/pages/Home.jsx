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
        setProducts(res.data);
      } catch {
        setError("Gagal mengambil data produk");
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
      <section id="katalog" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Katalog Produk</h2>
        {error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.product_id} onClick={() => navigate(`/produk/${product.product_id}`)} className="cursor-pointer">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Home; 