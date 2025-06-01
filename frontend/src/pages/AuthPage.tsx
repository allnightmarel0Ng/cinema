import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Film, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  // Determine if this is login or register page
  const mode: AuthMode = location.pathname.includes('register') ? 'register' : 'login';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        const success = await login(username, password);
        if (success) {
          navigate('/');
        }
      } else {
        const success = await register(username, password);
        if (success) {
          navigate('/login');
        }
      }
    } catch (error) {
      setErrorMsg(mode === 'login' 
        ? 'Login failed. Please check your credentials.' 
        : 'Registration failed. Please try a different username.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-dark-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center">
            <Film className="h-12 w-12 text-secondary-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'login' ? (
              <>
                Or{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300">
                  create a new account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-secondary-900/50 border border-secondary-500 text-white px-4 py-3 rounded relative\" role="alert">
              <span className="block sm:inline">{errorMsg}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 bg-dark-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 bg-dark-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 rounded-md text-white ${
                isSubmitting
                  ? 'bg-primary-700 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              } transition duration-150 ease-in-out`}
            >
              {isSubmitting ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {mode === 'login' ? (
                    <LogIn className="h-5 w-5 text-primary-400 group-hover:text-primary-300\" aria-hidden="true" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-primary-400 group-hover:text-primary-300\" aria-hidden="true" />
                  )}
                </span>
              )}
              {mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;