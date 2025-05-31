// src/pages/UserProfile.tsx
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { getUserProfile } from '../api/users';
import { MovieCard } from '../components/MovieCard';
import { ReviewCard } from '../components/ReviewCard';

export const UserProfile = () => {
    const { user } = useAuth();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: () => getUserProfile(user?.id || 0),
        enabled: !!user,
    });

    if (!user) return <div>Необходимо авторизоваться</div>;
    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Профиль: {user.username}</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">Оценённые фильмы</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {profile?.ratings.map((rating) => (
                            <MovieCard key={rating.movie_id} movie={rating.movie} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Мои отзывы</h2>
                    <div className="space-y-4">
                        {profile?.reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};