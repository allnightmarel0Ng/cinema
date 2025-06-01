import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Film, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-dark-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsMenuOpen(false)}>
              <Film className="h-8 w-8 text-secondary-500" />
              <span className="ml-2 text-xl font-bold text-white">CinemaHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies or actors..."
                className="px-4 py-2 pr-10 rounded-full bg-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={18} />
              </button>
            </form>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={`/profile`} 
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <User size={18} className="mr-1" />
                  <span>{username}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
                <Link to="/register" className="bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-700 transition duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 shadow-lg py-3 px-4">
          <form onSubmit={handleSearch} className="mt-2 mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies or actors..."
                className="w-full px-4 py-2 pr-10 rounded-full bg-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={18} />
              </button>
            </div>
          </form>
          
          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to={`/profile`} 
                  className="block py-2 text-gray-300 hover:text-white flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} className="mr-2" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-300 hover:text-white flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 bg-secondary-600 text-center text-white px-4 rounded-md hover:bg-secondary-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;