import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: number;
}

export const RatingStars = ({
                                rating,
                                onRatingChange,
                                interactive = false,
                                size = 20
                            }: RatingStarsProps) => {
    const handleClick = (newRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(newRating);
        }
    };

    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    disabled={!interactive}
                    className="focus:outline-none"
                >
                    {rating >= star ? (
                        <Star className={`fill-yellow-400 text-yellow-400`} size={size} />
                    ) : rating >= star - 0.5 ? (
                        <StarHalf className={`fill-yellow-400 text-yellow-400`} size={size} />
                    ) : (
                        <Star className="text-yellow-400" size={size} />
                    )}
                </button>
            ))}
        </div>
    );
};