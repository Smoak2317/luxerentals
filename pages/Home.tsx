import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Heart } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  // Get top 3 featured products
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://picsum.photos/id/447/1920/1080" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Wear the <span className="text-brand-500">Luxury</span> <br/> You Deserve
            </h1>
            <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-lg leading-relaxed">
              Premium designer Cholis and Lehengas for rent. Shine at every wedding without breaking the bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/catalog"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brand-600 hover:bg-brand-700 md:text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Browse Collection
              </Link>
              <a 
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-3 border border-stone-400 text-base font-medium rounded-full text-white hover:bg-white hover:text-stone-900 md:text-lg transition-all"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Trending This Season</h2>
              <p className="text-gray-600">Handpicked favorites for the upcoming wedding season.</p>
            </div>
            <Link to="/catalog" className="hidden md:flex items-center gap-1 text-brand-700 font-semibold hover:text-brand-900">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
             <Link to="/catalog" className="inline-block px-6 py-2 border border-brand-700 text-brand-700 rounded-full font-medium">
              View All Collection
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-16">Rental Made Simple</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Select Your Style</h3>
              <p className="text-gray-600">Browse our exclusive collection and pick the outfit that speaks to you.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Book via WhatsApp</h3>
              <p className="text-gray-600">Click the button to chat with us directly. We'll confirm availability and dates.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Flaunt & Return</h3>
              <p className="text-gray-600">Receive your sanitized outfit, shine at your event, and we'll pick it up.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;