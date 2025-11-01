import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, doLogout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 p-4 shadow-lg">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BMI</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">HealthTracker</span>
            <span className="font-bold text-lg gradient-text sm:hidden">BMI</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/instructor" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
              View
            </Link>
            <Link to="/instructor-login" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">
              Instructor Login
            </Link>
            
            {!user ? (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-secondary text-sm">
                  MemLogin
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button 
                  onClick={doLogout} 
                  className="text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/instructor" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 py-2"
                onClick={closeMobileMenu}
              >
                Instructor
              </Link>
              <Link 
                to="/instructor-login" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 py-2"
                onClick={closeMobileMenu}
              >
                Instructor Login
              </Link>
              
              {!user ? (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="btn-secondary text-sm text-center"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="btn-primary text-sm text-center"
                    onClick={closeMobileMenu}
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      doLogout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium py-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
