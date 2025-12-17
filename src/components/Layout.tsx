import { ReactNode, useEffect, useState } from 'react';
import { Phone, Mail } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center">
              <img
                src="/treetek-logo copy copy copy.png"
                alt="TREE TEK - Complete Tree Services & Stump Grinding"
                className="h-12 sm:h-16 w-auto"
              />
            </a>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Home</a>
              <a href="/services" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Services</a>
              <a href="/past-work" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Past Work</a>
              <a href="/quote" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Get a Quote</a>
              <a href="/social" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Social</a>
              <a href="/contact" className="text-emerald-900 hover:text-emerald-600 font-medium transition">Contact</a>
            </nav>

            <div className="hidden lg:flex items-center space-x-4">
              <a href="tel:3212829795" className="flex items-center text-emerald-900 hover:text-emerald-600 transition">
                <Phone className="w-4 h-4 mr-2" />
                <span className="font-semibold">(321) 282-9795</span>
              </a>
            </div>

            <button className="md:hidden p-2 text-emerald-900" onClick={() => {
              const nav = document.getElementById('mobile-nav');
              nav?.classList.toggle('hidden');
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav id="mobile-nav" className="hidden md:hidden pb-4 space-y-2 bg-white">
            <a href="/" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Home</a>
            <a href="/services" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Services</a>
            <a href="/past-work" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Past Work</a>
            <a href="/quote" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Get a Quote</a>
            <a href="/social" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Social</a>
            <a href="/contact" className="block py-2 text-emerald-900 hover:text-emerald-600 font-medium transition">Contact</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pb-24 md:pb-8">
        {children}
      </main>

      <footer className="bg-gray-950 text-white py-8 mt-auto relative border-t-2 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img
                src="/treetek-logo copy copy copy.png"
                alt="TREE TEK"
                className="h-32 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm">
                Complete Tree Services & Stump Grinding
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/services" className="hover:text-emerald-300 transition-colors">Services</a></li>
                <li><a href="/past-work" className="hover:text-emerald-300 transition-colors">Past Work</a></li>
                <li><a href="/quote" className="hover:text-emerald-300 transition-colors">Get a Quote</a></li>
                <li><a href="/contact" className="hover:text-emerald-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Contact Info</h3>
              <div className="space-y-2">
                <a href="tel:3212829795" className="flex items-center gap-2 text-gray-100 hover:text-emerald-300 transition-colors">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>(321) 282-9795</span>
                </a>
                <a href="mailto:Landtekbiz@gmail.com" className="flex items-center gap-2 text-gray-100 hover:text-emerald-300 transition-colors">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>Landtekbiz@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} TREE TEK. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-3">
        <div className="flex gap-3">
          <a
            href="tel:3212829795"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </a>
          <a
            href="/quote"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition"
          >
            Get a Quote
          </a>
        </div>
      </div>
    </div>
  );
}
