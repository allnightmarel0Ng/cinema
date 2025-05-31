// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers/AuthProvider';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { MoviePage } from './pages/MoviePage';
import { ActorPage } from './pages/ActorPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SearchResults } from './pages/SearchResults';
import { UserProfile } from './pages/UserProfile';
import { NotFound } from './pages/NotFound';
import './index.css';

// Создаем клиент для react-query с настройками кэширования
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Не обновлять данные при возврате на вкладку
            staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
            retry: 2, // Количество попыток повторного запроса при ошибке
            retryDelay: 1000, // Задержка между попытками
        },
    },
});

// Главный компонент приложения
export const App = () => {
    return (
        // Обертка для работы react-query
        <QueryClientProvider client={queryClient}>
            {/* Роутинг приложения */}
            <BrowserRouter>
                {/* Провайдер аутентификации */}
                <AuthProvider>
                    {/* Основной layout приложения */}
                    <div className="min-h-screen bg-gray-900 text-white">
                        {/* Навигационная панель */}
                        <NavBar />

                        {/* Основное содержимое страницы */}
                        <main className="pt-16 pb-8">
                            {/* Система маршрутизации */}
                            <Routes>
                                {/* Главная страница */}
                                <Route path="/" element={<Home />} />

                                {/* Страница фильма */}
                                <Route
                                    path="/movie/:id"
                                    element={<MoviePage />}
                                />

                                {/* Страница актера */}
                                <Route
                                    path="/actor/:id"
                                    element={<ActorPage />}
                                />

                                {/* Страница входа */}
                                <Route
                                    path="/login"
                                    element={<Login />}
                                />

                                {/* Страница регистрации */}
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />

                                {/* Страница результатов поиска */}
                                <Route
                                    path="/search"
                                    element={<SearchResults />}
                                />

                                {/* Страница профиля пользователя */}
                                <Route
                                    path="/profile"
                                    element={<UserProfile />}
                                />

                                {/* Страница 404 */}
                                <Route
                                    path="*"
                                    element={<NotFound />}
                                />
                            </Routes>
                        </main>

                        {/* Система уведомлений */}
                        <Toaster
                            position="top-center"
                            richColors  // Цветные уведомления
                            expand={true}  // Развернутый вид
                            closeButton  // Кнопка закрытия
                            toastOptions={{
                                duration: 5000,  // Время показа уведомления
                                style: {
                                    background: '#1F2937',  // Цвет фона
                                    color: '#FFFFFF',  // Цвет текста
                                    border: '1px solid #4B5563',  // Граница
                                },
                            }}
                        />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};