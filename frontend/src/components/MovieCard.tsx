// src/components/MovieCard.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react'; // Рекомендуемый способ

// Тип для фильма
interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    genres?: Array<{
        id: number;
        name: string;
    }>;
}

// Пропсы компонента
interface MovieCardProps {
    movie: Movie;
    showRating?: boolean;
    className?: string;
}

export const MovieCard = ({
                              movie,
                              showRating = true,
                              className = ''
                          }: MovieCardProps) => {
    const releaseDate = new Date(movie.release_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`relative overflow-hidden rounded-lg shadow-lg bg-gray-800 ${className}`}
>
    <Link to={`/movie/${movie.id}`} className="block">
        {/* Постер фильма */}
    {movie.poster_path ? (
        <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover"
        loading="lazy"
            />
    ) : (
        <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
        <span className="text-gray-400">Нет постера</span>
    </div>
    )}

    {/* Информация о фильме */}
    <div className="p-4">
    <h3 className="font-bold text-white truncate">{movie.title}</h3>

    {/* Рейтинг и дата релиза */}
    <div className="flex justify-between items-center mt-2">
        {showRating && (
            <div className="flex items-center">
            <Star className="text-yellow-400 w-4 h-4 mr-1" />
            <span className="text-yellow-400 text-sm">
                {movie.vote_average.toFixed(1)}
                </span>
                </div>
        )}
    <span className="text-gray-400 text-xs">{releaseDate}</span>
        </div>

    {/* Жанры */}
    {movie.genres?.length && (
        <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map(genre => (
                    <span
                        key={genre.id}
                className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                    >
                    {genre.name}
                    </span>
    ))}
        </div>
    )}
    </div>
    </Link>
    </motion.div>
);
};