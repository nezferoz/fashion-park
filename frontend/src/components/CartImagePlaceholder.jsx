import React from 'react';

const CartImagePlaceholder = ({ 
  productName,
  size = "w-16 h-16"
}) => {
  // Get appropriate placeholder based on product name
  const getPlaceholder = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('sweater') || lowerName.includes('hoodie') || lowerName.includes('jacket')) {
      return {
        icon: '🧥',
        color: 'bg-blue-100',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-600'
      };
    }
    
    if (lowerName.includes('tas') || lowerName.includes('bag') || lowerName.includes('handbag')) {
      return {
        icon: '👜',
        color: 'bg-purple-100',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-600'
      };
    }
    
    if (lowerName.includes('kaos') || lowerName.includes('tshirt') || lowerName.includes('shirt')) {
      return {
        icon: '👕',
        color: 'bg-green-100',
        borderColor: 'border-green-300',
        textColor: 'text-green-600'
      };
    }
    
    if (lowerName.includes('celana') || lowerName.includes('pants') || lowerName.includes('jeans')) {
      return {
        icon: '👖',
        color: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
        textColor: 'text-indigo-600'
      };
    }
    
    if (lowerName.includes('sepatu') || lowerName.includes('sandal') || lowerName.includes('shoes')) {
      return {
        icon: '👟',
        color: 'bg-orange-100',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-600'
      };
    }
    
    if (lowerName.includes('dress') || lowerName.includes('gown')) {
      return {
        icon: '👗',
        color: 'bg-pink-100',
        borderColor: 'border-pink-300',
        textColor: 'text-pink-600'
      };
    }
    
    // Default for other products
    return {
      icon: '📦',
      color: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-600'
    };
  };

  const placeholder = getPlaceholder(productName);

  return (
    <div className={`${size} relative`}>
      {/* Main placeholder */}
      <div className={`w-full h-full ${placeholder.color} ${placeholder.borderColor} border-2 rounded-lg flex items-center justify-center shadow-sm`}>
        <div className="text-center">
          <div className="text-3xl mb-1">{placeholder.icon}</div>
          <div className={`text-xs font-semibold ${placeholder.textColor}`}>
            {productName.length > 12 ? productName.substring(0, 12) + '...' : productName}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full opacity-40"></div>
    </div>
  );
};

export default CartImagePlaceholder;
