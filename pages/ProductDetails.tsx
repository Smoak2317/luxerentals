import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { generateWhatsAppLink } from '../services/whatsapp';
import { ArrowLeft, MessageCircle, Ruler, Truck, ShieldCheck, Star } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find product by ID
  const product = products.find(p => p.id === id);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/catalog" className="text-brand-600 hover:underline">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-brand-700 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Image */}
          <div className="space-y-4">
             <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4] bg-stone-100 relative">
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full h-full object-cover"
               />
               {!product.available && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-stone-900 px-6 py-2 font-bold uppercase tracking-widest text-xl rounded shadow-lg">Currently Rented</span>
                 </div>
               )}
             </div>
             <div className="grid grid-cols-3 gap-2">
                {/* Thumbnails (Simulated for aesthetics) */}
                <div className="aspect-square rounded-lg bg-stone-100 overflow-hidden opacity-50 hover:opacity-100 cursor-pointer">
                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="aspect-square rounded-lg bg-stone-100 overflow-hidden opacity-50 hover:opacity-100 cursor-pointer">
                     <img src={product.image} className="w-full h-full object-cover grayscale" alt="" />
                </div>
                <div className="aspect-square rounded-lg bg-stone-100 overflow-hidden opacity-50 hover:opacity-100 cursor-pointer">
                     <img src={product.image} className="w-full h-full object-cover sepia" alt="" />
                </div>
             </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col h-full">
            <div className="mb-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {product.category}
                </span>
                <span className="flex items-center gap-1 text-gold text-sm font-medium">
                    <Star className="h-4 w-4 fill-current" /> 4.9 (120 reviews)
                </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-gray-100">
               <p className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
               <div>
                 <p className="text-sm text-gray-400 line-through">MRP ₹{product.originalPrice.toLocaleString()}</p>
                 <p className="text-sm text-green-600 font-medium">Rent & Save 95%</p>
               </div>
            </div>

            <div className="prose prose-stone text-gray-600 mb-8">
              <p>{product.description}</p>
              <ul className="mt-4 space-y-2 list-none pl-0">
                  <li className="flex items-center gap-2"><Ruler className="h-5 w-5 text-gray-400"/> Size: <span className="font-semibold text-gray-900">{product.size}</span></li>
                  <li className="flex items-center gap-2"><Truck className="h-5 w-5 text-gray-400"/> Free delivery & pickup</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-gray-400"/> Dry-cleaned & Sanitized</li>
              </ul>
            </div>

            <div className="mt-auto">
              <a 
                href={generateWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  product.available 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="h-6 w-6" />
                {product.available ? 'Rent via WhatsApp' : 'Currently Unavailable'}
              </a>
              <p className="text-center text-xs text-gray-400 mt-3">
                Clicking this will open WhatsApp with a pre-filled message about this item.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;