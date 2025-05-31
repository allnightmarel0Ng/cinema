import { useState } from 'react';
import { Button } from './ui/button';
import { RatingStars } from './RatingStars';
import { Textarea } from './ui/textarea';

interface ReviewFormProps {
    movieId: number;
    onSubmit: (review: { rating: number; text: string }) => void;
}

export const ReviewForm = ({ movieId, onSubmit }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ rating, text });
        setText('');
        setRating(0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваша оценка
                </label>
                <RatingStars
                    rating={rating}
                    onRatingChange={setRating}
                    interactive={true}
                />
            </div>
            <div>
                <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-2">
                    Отзыв
                </label>
                <Textarea
                    id="review"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="bg-gray-700 text-white"
                    rows={4}
                    placeholder="Напишите ваш отзыв..."
                />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Отправить отзыв
            </Button>
        </form>
    );
};