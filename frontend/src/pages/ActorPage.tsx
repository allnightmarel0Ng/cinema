// src/pages/ActorPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getActorById, getMoviesByActor } from '../api/actors';
import { ActorCard } from '../components/ActorCard';
import { MovieCard } from '../components/MovieCard';
import { Loader2 } from 'lucide-react';

export const ActorPage = () => {
    const { id } = useParams<{ id: string }>();

    const { data: actor, isLoading: isActorLoading } = useQuery({
        queryKey: ['actor', id],
        queryFn: () => getActorById(Number(id)),
    });

    const { data: movies, isLoading: isMoviesLoading } = useQuery({
        queryKey: ['actor-movies', id],
        queryFn: () => getMoviesByActor(Number(id)),
    });

    if (isActorLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-12 w-12 text-red-500" />
            </div>
        );
    }

    if (!actor) return <div>Актёр не найден</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                    <ActorCard actor={actor} />
                </div>

                <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-4">Фильмы с участием</h2>
                    {isMoviesLoading ? (
                        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {movies?.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};