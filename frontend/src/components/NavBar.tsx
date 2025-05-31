// src/components/NavBar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Search } from './Search';
import { Menu, X, User, Film, Home, LogIn, LogOut, Star } from 'lucide-react';

export const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { token, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    return (
        <header className={`fixed w-full z-50 transition-all ${
            scrolled ? 'bg-gray-900/95 backdrop-blur-sm py-2 shadow-lg' : 'bg-gray-900/80 py-4'
        }`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Логотип и основная навигация */}
                <div className="flex items-center space-x-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <Film className="text-red-500 h-6 w-6" />
                        <span className="text-white font-bold text-xl hidden sm:inline">CinemaHub</span>
                    </Link>

                    <nav className="hidden md:flex space-x-6 ml-8">
                        <NavLink to="/" icon={<Home size={18} />} text="Главная" />
                        <NavLink to="/popular" icon={<Star size={18} />} text="Популярные" />
                        {token && <NavLink to="/watchlist" icon={<User size={18} />} text="Мой список" />}
                    </nav>
                </div>

                {/* Правая часть (поиск + авторизация) */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:block w-64">
                        <Search />
                    </div>

                    {token ? (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="flex items-center space-x-1 text-white hover:text-red-400 transition"
                            >
                                <User size={20} />
                                <span>Профиль</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-white hover:text-red-400 transition"
                            >
                                <LogOut size={20} />
                                <span>Выйти</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden md:flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                        >
                            <LogIn size={18} />
                            <span>Войти</span>
                        </Link>
                    )}

                    {/* Мобильное меню */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white p-2"
                        aria-label="Меню"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

// Компоненты-помощники
const NavLink = ({
                     to,
                     icon,
                     text
                 }: {
    to: string;
    icon: React.ReactNode;
    text: string
}) => (
    <Link
        to={to}
        className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
    >
        {icon}
        <span>{text}</span>
    </Link>
);