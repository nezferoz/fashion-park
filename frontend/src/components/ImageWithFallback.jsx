import React from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  ...props 
}) => {
  const handleImageError = (e) => {
    // Jika gambar gagal load, ganti dengan placeholder sederhana
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dy='.3em'%3E📷%3C/text%3E%3C/svg%3E";
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ImageWithFallback;
