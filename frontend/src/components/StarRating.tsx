import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 'md'
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingChange = (newRating: number) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const starSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size];

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleRatingChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} p-1 focus:outline-none transition-colors`}
            disabled={readOnly}
            aria-label={`Rate ${starValue} out of ${maxRating}`}
          >
            <Star
              size={starSize}
              className={`
                ${(hoverRating || rating) >= starValue 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-400'}
                transition-colors duration-200
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;