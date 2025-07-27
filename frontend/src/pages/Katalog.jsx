import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useLoading } from "../context/LoadingContext";

const Katalog = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

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
        setProducts(prodRes.data);
      } catch {
        setError("Gagal mengambil data katalog");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setIsLoading]);

  const filteredProducts =
    selectedCategory === 0
      ? products
      : products.filter((p) => p.category_id === selectedCategory);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 mb-8 md:mb-0">
          <h3 className="text-lg font-bold mb-4">Kategori</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.category_id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded transition font-medium ${selectedCategory === cat.category_id ? "bg-blue-400 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
                  onClick={() => setSelectedCategory(cat.category_id)}
                >
                  {cat.category_name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Katalog Produk</h2>
          {error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.product_id} onClick={() => navigate(`/produk/${product.product_id}`)} className="cursor-pointer">
                  <ProductCard {...product} />
                  
                </div>
              ))}
            </div>
          )}
        </main>
      </section>
      <Footer />
    </div>
  );
};

export default Katalog; 