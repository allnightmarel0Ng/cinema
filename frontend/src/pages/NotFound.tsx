// src/pages/NotFound.tsx
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Страница не найдена</p>
            <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
    );
};