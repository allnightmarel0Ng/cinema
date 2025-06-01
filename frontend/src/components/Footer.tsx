import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-800 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <Film className="h-8 w-8 text-secondary-500" />
              <span className="ml-2 text-xl font-bold text-white">CinemaHub</span>
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Your gateway to the world of cinema
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Browse
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Popular Movies
                  </Link>
                </li>
                <li>
                  <Link to="/search?q=action" className="text-gray-400 hover:text-white">
                    Action Movies
                  </Link>
                </li>
                <li>
                  <Link to="/search?q=comedy" className="text-gray-400 hover:text-white">
                    Comedy Movies
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Account
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-400 hover:text-white">
                    My Profile
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-dark-700">
          <p className="text-sm text-gray-400 text-center flex items-center justify-center">
            Made with <Heart className="h-4 w-4 text-secondary-500 mx-1 fill-secondary-500" /> for cinema enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;