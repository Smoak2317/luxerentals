import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        {!product.available && (
          <div className="absolute top-4 right-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full opacity-90">
            Booked
          </div>
        )}
        {product.available && (
           <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full opacity-90 shadow-md">
            Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
          {product.category}
        </div>
        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-1 leading-tight group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div>
            <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
            <p className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/day</span></p>
          </div>
          <Link 
            to={`/product/${product.id}`}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            View <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;