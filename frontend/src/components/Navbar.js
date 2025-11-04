import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon, Scissors as ScissorsIcon, Phone as PhoneIcon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Book Appointment', href: '/appointments' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const isActivePage = (href) => {
    if (href.startsWith('#')) return false;
    return location.pathname === href;
  };

  const handleNavClick = (href, itemName) => {
    if (href.startsWith('#')) {
      // Handle hash links for scrolling to sections
      const sectionId = href.substring(1);
      
      // If we're not on the home page, navigate to home first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // We're already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      
      // Close mobile menu if open
      setIsOpen(false);
      return false; // Prevent default Link behavior
    }
    
    // For regular links, let React Router handle it
    setIsOpen(false);
    return true;
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <ScissorsIcon className="h-8 w-8 text-primary-red" />
              <div>
                <h1 className="text-xl font-bold text-primary-black">Dreams Saloon</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Barbershop – Hair Cut & Shaves</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              if (item.href.startsWith('#')) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href, item.name)}
                    className="px-3 py-2 text-sm font-medium transition-colors duration-200 text-gray-700 hover:text-primary-red"
                  >
                    {item.name}
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActivePage(item.href)
                      ? 'text-primary-red border-b-2 border-primary-red'
                      : 'text-gray-700 hover:text-primary-red'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Call Button */}
            <a
              href="tel:9963388556"
              className="btn-primary flex items-center space-x-2"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>Call Now</span>
            </a>

            {/* Admin Login */}
            <Link
              to="/admin/login"
              className="text-sm text-gray-600 hover:text-primary-red"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-red focus:outline-none"
            >
              {isOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                if (item.href.startsWith('#')) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href, item.name)}
                      className="block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200 text-gray-700 hover:text-primary-red hover:bg-gray-50"
                    >
                      {item.name}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                      isActivePage(item.href)
                        ? 'text-primary-red bg-red-50'
                        : 'text-gray-700 hover:text-primary-red hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Call Button */}
              <div className="px-3 py-2">
                <a
                  href="tel:9963388556"
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Call Now</span>
                </a>
              </div>

              {/* Mobile Admin Login */}
              <Link
                to="/admin/login"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-red"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;