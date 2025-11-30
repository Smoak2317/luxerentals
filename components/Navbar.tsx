import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/catalog' },
    { name: 'How it Works', path: '/#how-it-works' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-brand-700" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">CholiQueen</h1>
              <p className="text-xs text-brand-700 uppercase tracking-widest font-semibold">Rentals</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path) 
                    ? 'text-brand-700 font-semibold' 
                    : 'text-gray-600 hover:text-brand-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/catalog"
              className="bg-brand-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-brand-900 transition-colors shadow-md hover:shadow-lg"
            >
              Rent Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50"
              >
                {link.name}
              </Link>
            ))}
             <Link
                to="/catalog"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 mt-4 text-center rounded-md text-base font-bold text-white bg-brand-700 hover:bg-brand-900"
              >
                Browse Collection
              </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;