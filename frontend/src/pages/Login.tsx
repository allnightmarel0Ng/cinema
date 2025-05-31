// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';

export const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        password: '',
    });
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validate = () => {
        let valid = true;
        const newErrors = {
            username: '',
            password: '',
        };

        if (!formData.username.trim()) {
            newErrors.username = 'Введите имя пользователя';
            valid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Введите пароль';
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await login(formData);
            // @ts-ignore
            setToken(response.token);
            navigate('/');
        } catch (error: any) {
            setApiError(
                error.response?.data?.error ||
                'Неверное имя пользователя или пароль'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Вход в CinemaHub
                </h1>

                {apiError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                            Имя пользователя
                        </label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className={`bg-gray-700 text-white ${errors.username && 'border-red-500'}`}
                            placeholder="Ваш username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            Пароль
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`bg-gray-700 text-white ${errors.password && 'border-red-500'}`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Вход...
                            </>
                        ) : (
                            'Войти'
                        )}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-400">
                    Нет аккаунта?{' '}
                    <Link
                        to="/register"
                        className="text-red-400 hover:underline"
                    >
                        Зарегистрируйтесь
                    </Link>
                </div>
            </div>
        </div>
    );
};