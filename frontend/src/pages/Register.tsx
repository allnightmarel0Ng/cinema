// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(username, password);
            navigate('/');
        } catch (err) {
            setError('Ошибка регистрации');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
    <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
    {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4">
    <Input
        type="text"
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        />
        <Input
            type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        />
        <Button type="submit" className="w-full">
        Зарегистрироваться
        </Button>
        </div>
        <p className="mt-4 text-center text-gray-400">
        Уже есть аккаунт?{' '}
        <button
        type="button"
        onClick={() => navigate('/login')}
        className="text-red-400 hover:underline"
            >
            Войти
            </button>
            </p>
            </form>
            </div>
    );
    };