// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { Movie } from '../api/movies';
import { getPopularMovies } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import { HeroBanner } from '../components/HeroBanner';
import { GenreSection } from '../components/GenreSection';
import { Loader } from '../components/Loader';

export const Home = () => {
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загружаем популярные фильмы
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const data = await getPopularMovies(1, 10);
                setPopularMovies(data.results);
            } catch (err) {
                setError('Не удалось загрузить фильмы');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <Loader />;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="pb-10">
            {/* Баннер с главным фильмом */}
            {popularMovies.length > 0 && (
                <HeroBanner movie={popularMovies[0]} />
            )}

            <div className="container mx-auto px-4">
                {/* Секция "Популярные" */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-white">
                        Популярные фильмы
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {popularMovies.slice(1, 6).map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                className="hover:shadow-red-500/20"
                            />
                        ))}
                    </div>
                </section>

                {/* Секции по жанрам */}
                <GenreSection
                    genreId={28}
                    title="Лучшие боевики"
                    movies={popularMovies}
                />

                <GenreSection
                    genreId={878}
                    title="Космические приключения"
                    movies={popularMovies}
                    className="mt-12"
                />

                {/* Призыв к действию */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Находите свои любимые фильмы
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Регистрируйтесь, чтобы сохранять понравившиеся фильмы,
                        ставить оценки и получать персональные рекомендации.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition">
                        Присоединиться
                    </button>
                </div>
            </div>
        </div>
    );
};