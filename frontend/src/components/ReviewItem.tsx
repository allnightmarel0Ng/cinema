import React from 'react';
import { ThumbsUp, ThumbsDown, Trash, Edit } from 'lucide-react';
import { Review } from '../types/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ReviewItemProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onEdit, onDelete }) => {
  const { userId } = useAuth();
  const isAuthor = userId === review.user_id;
  
  return (
    <div className={`${review.liked ? 'bg-green-950/20' : 'bg-red-950/20'} p-4 rounded-lg shadow-md mb-4 border ${review.liked ? 'border-green-900/50' : 'border-red-900/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white">{review.title}</h4>
        <div className="flex items-center">
          {review.liked ? (
            <div className="flex items-center bg-green-900/30 text-green-400 px-2 py-1 rounded">
              <ThumbsUp className="h-4 w-4 mr-1 fill-green-400" />
              <span className="text-sm">Recommended</span>
            </div>
          ) : (
            <div className="flex items-center bg-red-900/30 text-red-400 px-2 py-1 rounded">
              <ThumbsDown className="h-4 w-4 mr-1 fill-red-400" />
              <span className="text-sm">Not Recommended</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-300 mb-3">{review.text}</p>
      
      {isAuthor && (
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onEdit} 
            className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
            aria-label="Edit review"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={onDelete} 
            className="p-1 text-gray-400 hover:text-secondary-500 transition-colors"
            aria-label="Delete review"
          >
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;