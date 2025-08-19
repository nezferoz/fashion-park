import React, { useState, useEffect } from "react";

const HeroSection = () => {
  const [imagesLoaded, setImagesLoaded] = useState({
    storefront: false,
    interior: false
  });

  // Check if images exist
  useEffect(() => {
    const checkImages = async () => {
      try {
        const storefrontImg = new Image();
        storefrontImg.onload = () => setImagesLoaded(prev => ({ ...prev, storefront: true }));
        storefrontImg.onerror = () => setImagesLoaded(prev => ({ ...prev, storefront: false }));
        storefrontImg.src = '/images/depan.jpeg';

        const interiorImg = new Image();
        interiorImg.onload = () => setImagesLoaded(prev => ({ ...prev, interior: true }));
        interiorImg.onerror = () => setImagesLoaded(prev => ({ ...prev, interior: false }));
        interiorImg.src = '/images/dalam.jpeg';
      } catch (error) {
        console.log('Images not loaded yet');
      }
    };

    checkImages();
  }, []);

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Selamat Datang di<br />
            <span className="text-blue-600">FASHION PARK</span>
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-medium">
            Toko Pakaian Pria Terlengkap
          </p>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Temukan koleksi pakaian pria terbaru dengan harga terjangkau. 
            Kami menyediakan berbagai jenis pakaian mulai dari kaos, kemeja, 
            celana, jaket, dan aksesoris fashion lainnya.
          </p>
          <a href="#katalog" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 font-bold text-lg">
            Lihat Produk
          </a>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          {/* Store Front Image */}
          <div className="relative">
            {imagesLoaded.storefront ? (
              <img 
                src="/images/depan.jpeg" 
                alt="Depan Toko Fashion Park" 
                className="rounded-lg shadow-xl w-full max-w-lg object-cover"
              />
            ) : (
              <div className="w-full max-w-lg h-64 bg-gray-100 rounded-lg shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🏪</div>
                  <p className="text-gray-700 font-bold text-lg">FASHION PARK</p>
                  <p className="text-gray-600 text-sm">Depan Toko</p>
                  <p className="text-gray-500 text-xs mt-1">Upload: depan.jpeg</p>
                </div>
              </div>
            )}
          </div>
          {/* Interior Store Image */}
          <div className="relative">
            {imagesLoaded.interior ? (
              <img 
                src="/images/dalam.jpeg" 
                alt="Dalam Toko Fashion Park" 
                className="rounded-lg shadow-xl w-full max-w-lg object-cover"
              />
            ) : (
              <div className="w-full max-w-lg h-64 bg-gray-100 rounded-lg shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🛍️</div>
                  <p className="text-gray-700 font-bold text-lg">Koleksi Pakaian</p>
                  <p className="text-gray-600 text-sm">Dalam Toko</p>
                  <p className="text-gray-500 text-xs mt-1">Upload: dalam.jpeg</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 