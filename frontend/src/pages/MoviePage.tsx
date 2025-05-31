import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getMovieReviews } from '../api/movies';
import { getActorById } from '../api/actors';
import { MovieCard } from '../components/MovieCard';
import { ReviewForm } from '../components/ReviewForm';
import { RatingStars } from '../components/RatingStars';
import { ActorCard } from '../components/ActorCard';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import {data} from "autoprefixer";

type MovieDetails = {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    genres: { id: number; name: string }[];
    actors?: {
        id: number;
        name: string;
        profile_path: string | null;
    }[];
};

type Review = {
    id: number;
    author: string;
    content: string;
    rating: number;
    created_at: string;
};

export const MoviePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieById(Number(id));
                const reviewsData = await getMovieReviews(Number(id));

                const actorsWithDetails = await Promise.all(
                    (movieData.actors || []).slice(0, 10).map(async (actor) => {
                        const details = await getActorById(actor.id);
                        return {
                            ...actor,
                            profile_path: details.profile_path,
                        };
                    })
                );

                // setMovie({
                //     ...movieData,
                //     actors: actorsWithDetails,
                // });
                setReviews(reviewsData);
            } catch (err) {
                setError('Не удалось загрузить данные фильма');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-12 w-12 text-red-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl text-red-500 mb-4">{error}</h2>
                <Button onClick={() => navigate('/')}>На главную</Button>
            </div>
        );
    }

    if (!movie) return null;

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Баннер фильма */}
            <div
                className="relative h-64 md:h-96 bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                }}
            >
                <div className="container mx-auto px-4 absolute bottom-0 left-0 right-0 pb-8">
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                    <div className="flex items-center space-x-4">
                        <RatingStars rating={movie.vote_average / 2} />
                        <span>{movie.vote_average.toFixed(1)}/10</span>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Основная информация */}
                    <div className="md:w-2/3">
                        <div className="flex space-x-4 mb-6">
                            <Button
                                variant={showTrailer ? 'outline' : 'default'}
                                onClick={() => setShowTrailer(false)}
                            >
                                О фильме
                            </Button>
                            <Button
                                variant={showTrailer ? 'default' : 'outline'}
                                onClick={() => setShowTrailer(true)}
                            >
                                Трейлер
                            </Button>
                        </div>

                        {showTrailer ? (
                            <div className="aspect-video bg-black rounded-lg mb-6">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/ТУТ_ID_ТРЕЙЛЕРА?autoplay=1`}
                                    title={`Трейлер ${movie.title}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-2">Описание</h3>
                                <p className="text-gray-300 mb-6">{movie.overview || 'Нет описания'}</p>

                                <h3 className="text-xl font-bold mb-2">Жанры</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {movie.genres.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                                        >
                      {genre.name}
                    </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Отзывы */}
                        <section className="mt-8">
                            <h3 className="text-2xl font-bold mb-4">Отзывы</h3>
                            <ReviewForm
                                movieId={movie.id}
                                onSubmit={(data) =>
                                    console.log(data)}
                            />

                            <div className="space-y-4 mt-6">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold">{review.author}</h4>
                                                <RatingStars rating={review.rating} />
                                            </div>
                                            <p className="text-gray-300">{review.content}</p>
                                            <p className="text-gray-500 text-sm mt-2">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">Пока нет отзывов</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Боковая панель */}
                    <div className="md:w-1/3">
                        <div className="sticky top-4">
                            <MovieCard
                                movie={{
                                    id: movie.id,
                                    title: movie.title,
                                    poster_path: movie.poster_path,
                                    vote_average: movie.vote_average,
                                    release_date: movie.release_date,
                                    genres: movie.genres
                                }}
                                className="w-full"
                            />

                            {/* Актёры */}
                            <section className="mt-6">
                                <h3 className="text-xl font-bold mb-4">Актёры</h3>
                                <div className="space-y-3">
                                    {(movie.actors || []).slice(0, 5).map(actor => (
                                        <ActorCard
                                            key={actor.id}
                                            actor={{
                                                ...actor
                                            }}
                                        />
                                    ))}
                                </div>
                                {(movie.actors || []).length > 5 && (
                                    <Button
                                        variant="link"
                                        className="text-red-400 mt-2 p-0"
                                        onClick={() => navigate(`/movie/${id}/cast`)}
                                    >
                                        Все актёры →
                                    </Button>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};