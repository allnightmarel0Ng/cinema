import { Movie } from '../api/movies';
import { MovieCard } from './MovieCard';

interface GenreSectionProps {
    genreId: number;
    title: string;
    movies: Movie[];
    className?: string;
}

export const GenreSection = ({
                                 genreId,
                                 title,
                                 movies,
                                 className = ''
                             }: GenreSectionProps) => {
    return (
        <section className={`mb-8 ${className}`}>
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {movies
                    .filter(movie => movie.genres.some(g => g.id === genreId))
                    .slice(0, 5)
                    .map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
            </div>
        </section>
    );
};