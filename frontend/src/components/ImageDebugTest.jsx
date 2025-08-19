import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const ImageDebugTest = ({ imageId, productName }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [imageUrl, setImageUrl] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    if (!imageId) {
      setImageStatus('no-id');
      return;
    }

    const url = getImageUrl(imageId);
    setImageUrl(url);
    console.log('🔍 ImageDebugTest:', { imageId, productName, url });

    // Test image loading
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loaded successfully:', url);
      setImageStatus('success');
    };
    img.onerror = (error) => {
      console.error('❌ Image failed to load:', url, error);
      setImageStatus('error');
      setErrorDetails('Failed to load image');
    };
    img.src = url;
  }, [imageId, productName]);

  const getStatusDisplay = () => {
    switch (imageStatus) {
      case 'loading':
        return (
          <div className="w-16 h-16 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-xs text-blue-600 mt-1">Loading</div>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16">
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover rounded-lg border-2 border-green-400"
            />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 border-2 border-red-400 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl">❌</div>
              <div className="text-xs text-red-600">Error</div>
              <div className="text-xs text-gray-500">ID: {imageId}</div>
            </div>
          </div>
        );
      case 'no-id':
        return (
          <div className="w-16 h-16 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl">📦</div>
              <div className="text-xs text-gray-600">No ID</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-16 h-16 relative">
      {getStatusDisplay()}
      
      {/* Debug overlay */}
      <div className="absolute -top-2 -right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded-full">
        {imageStatus === 'loading' ? '🔄' : 
         imageStatus === 'success' ? '✅' : 
         imageStatus === 'error' ? '❌' : '⚠️'}
      </div>
      
      {/* Status info on hover */}
      <div className="absolute -bottom-20 left-0 bg-black bg-opacity-90 text-white text-xs p-2 rounded-lg whitespace-nowrap z-50 opacity-0 hover:opacity-100 transition-opacity">
        <div><strong>Status:</strong> {imageStatus}</div>
        <div><strong>Image ID:</strong> {imageId || 'NULL'}</div>
        <div><strong>URL:</strong> {imageUrl}</div>
        {errorDetails && <div><strong>Error:</strong> {errorDetails}</div>}
      </div>
    </div>
  );
};

export default ImageDebugTest;
