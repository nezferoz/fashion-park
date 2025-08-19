import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Brand & Copyright */}
          <div className="flex-1">
            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-400">Fashion Park</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              &copy; {new Date().getFullYear()} Distro Fashion Park. All rights reserved.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/fashionparksintang?igsh=NnN2ZHF4aGhyNGU4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200"
                aria-label="Instagram Fashion Park"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/>
                </svg>
                <span className="text-sm">@fashionparksintang</span>
              </a>
            </div>
          </div>

          {/* Store Addresses */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">Lokasi Toko</h3>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Cabang Sintang</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Jl. Lintas Melawi, Ladang, Kec. Sintang,<br />
                  Kabupaten Sintang, Kalimantan Barat
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Cabang Sekadau</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Jl. Irian, Sungai Ringin, Kec. Sekadau Hilir,<br />
                  Kabupaten Sekadau, Kalimantan Barat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-xs text-gray-500">
            Fashion Park - Fashion Terdepan di Kalimantan Barat
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 