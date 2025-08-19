import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const DataFallback = ({ 
  title = "Data Tidak Tersedia", 
  message = "Gagal memuat data dari server", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-md">{message}</p>
        
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaRedo className="mr-2" />
            Coba Lagi
          </button>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          <p>Kemungkinan penyebab:</p>
          <ul className="mt-2 space-y-1">
            <li>• Database server tidak berjalan</li>
            <li>• Koneksi internet bermasalah</li>
            <li>• Server sedang maintenance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataFallback;
