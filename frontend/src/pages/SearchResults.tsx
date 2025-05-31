// src/pages/SearchResults.tsx (исправленная версия)
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMovies, searchActors, type MovieSearchResult, type ActorSearchResult } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import { ActorCard } from '../components/ActorCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader } from '../components/ui/loader';

export const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data: movies, isLoading: isMoviesLoading } = useQuery({
        queryKey: ['search-movies', query],
        queryFn: () => searchMovies(query),
        enabled: !!query,
    });

    const { data: actors, isLoading: isActorsLoading } = useQuery({
        queryKey: ['search-actors', query],
        queryFn: () => searchActors(query),
        enabled: !!query,
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Результаты поиска: "{query}"</h1>

            <Tabs defaultValue="movies" className="w-full">
                <TabsList>
                    <TabsTrigger value="movies">Фильмы</TabsTrigger>
                    <TabsTrigger value="actors">Актёры</TabsTrigger>
                </TabsList>

                <TabsContent value="movies">
                    {isMoviesLoading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {movies?.map((movie: MovieSearchResult) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="actors">
                    {isActorsLoading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {actors?.map((actor: ActorSearchResult) => (
                                <ActorCard
                                    key={actor.id}
                                    actor={{
                                        id: actor.id,
                                        name: actor.name || 'Неизвестный актёр',
                                        profile_path: actor.profile_path,
                                        character: actor.character
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};