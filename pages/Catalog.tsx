import React, { useState, useMemo } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Filter, Search } from 'lucide-react';

const Catalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const categories = ['All', 'Bridal', 'Party Wear', 'Sangeet', 'Reception'];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, selectedCategory, maxPrice]);

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated range of designer ethnic wear available for rent.
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 mb-10">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search for lehengas, colors..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-brand-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

             {/* Price Slider (Simple) */}
            <div className="flex items-center gap-4 w-full md:w-1/4">
               <Filter className="h-5 w-5 text-gray-400" />
               <div className="flex-1">
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Price Max:</span>
                   <span className="font-bold text-gray-900">₹{maxPrice}</span>
                 </div>
                 <input 
                  type="range" 
                  min="1000" 
                  max="5000" 
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
               </div>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No products found matching your criteria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All'); setMaxPrice(5000);}}
              className="mt-4 text-brand-600 font-medium hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Catalog;