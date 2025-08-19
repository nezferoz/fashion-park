import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ 
  to = "/katalog", 
  text = "Kembali", 
  className = "",
  showArrow = true 
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 ${className}`}
    >
      {showArrow && <span className="text-blue-600">←</span>}
      {text}
    </button>
  );
};

export default BackButton;
