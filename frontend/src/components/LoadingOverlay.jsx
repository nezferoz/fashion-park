import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-white border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingOverlay; 