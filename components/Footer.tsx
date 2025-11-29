import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { generateGeneralInquiryLink } from '../services/whatsapp';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-xl font-serif font-bold mb-4">CholiQueen</h3>
            <p className="text-sm leading-relaxed mb-4">
              Making luxury ethnic wear accessible. Rent your dream outfit at a fraction of the cost.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-500 transition"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-brand-500 transition"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-brand-500 transition"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/#/catalog" className="hover:text-white transition">Collection</a></li>
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Rental</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-500" />
                <span>+91 987 654 3210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-500" />
                <span>hello@choliqueen.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-500 mt-1" />
                <span>123 Fashion Street, New Delhi, India 110001</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
             <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Have a question?</h4>
             <p className="text-sm mb-4">Chat with us directly on WhatsApp for custom sizing and availability.</p>
             <a 
               href={generateGeneralInquiryLink()}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded transition-colors"
             >
               Chat on WhatsApp
             </a>
          </div>

        </div>
        
        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} CholiQueen Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;