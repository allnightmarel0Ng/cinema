import { Movie } from '../api/movies';
import { Button } from './ui/button';

interface HeroBannerProps {
    movie: Movie;
}

export const HeroBanner = ({ movie }: HeroBannerProps) => {
    return (
        <div
            className="relative h-[400px] md:h-[500px] bg-cover bg-center flex items-end"
            style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%), url(https://image.tmdb.org/t/p/original${movie.poster_path})`
            }}
        >
            <div className="container mx-auto px-4 pb-8 z-10">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {movie.title}
                </h1>
                <div className="flex gap-4">
                    <Button variant="primary" size="lg">
                        Смотреть
                    </Button>
                    <Button variant="secondary" size="lg">
                        Трейлер
                    </Button>
                </div>
            </div>
        </div>
    );
};