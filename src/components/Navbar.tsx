// src/components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'X Feed', href: '/x-feed' },
    { name: 'Ethical Leaderboard', href: '/ethical-leaderboard' },
    { name: 'Predictions', href: '/predictions' },
  ];

  return (
    <nav className="bg-white text-black border-b border-black sm:border-b sm:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Logo/Brand */}
          <div className="flex items-center justify-center flex-1 sm:justify-start">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold">
                NBAAAI
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-semibold text-black hover:bg-gray-100"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-semibold text-black hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;