import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-white py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            Tampil Stylish & Kekinian<br />
            <span className="text-blue-600">Distro Fashion Park</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Temukan koleksi pakaian pria terbaru, harga terjangkau, dan promo menarik setiap hari!
          </p>
          <a href="#katalog" className="inline-block bg-blue-600 text-white px-8 py-3 rounded shadow hover:bg-blue-700 transition font-semibold">
            Belanja Sekarang
          </a>
        </div>
        <div className="flex-1 flex justify-center">
          <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&q=80" alt="Fashion Hero" className="rounded-xl shadow-lg w-full max-w-md object-cover" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 