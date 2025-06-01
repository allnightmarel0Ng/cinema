import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReviewFormProps {
  initialReview?: {
    title: string;
    text: string;
    liked: boolean;
  };
  onSubmit: (review: { title: string; text: string; liked: boolean }) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialReview = { title: '', text: '', liked: true },
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState(initialReview.title);
  const [text, setText] = useState(initialReview.text);
  const [liked, setLiked] = useState(initialReview.liked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, text, liked });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-700 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-white font-bold text-lg mb-4">
        {initialReview.title ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">
          Would you recommend this movie?
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setLiked(true)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              liked 
                ? 'bg-green-600 text-white border-2 border-green-500'
                : 'bg-dark-600 text-gray-300 hover:bg-green-900/30 border-2 border-transparent'
            }`}
          >
            <ThumbsUp className={`mr-2 h-5 w-5 ${liked ? 'fill-white' : ''}`} />
            Recommend
          </button>
          <button
            type="button"
            onClick={() => setLiked(false)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              !liked 
                ? 'bg-red-600 text-white border-2 border-red-500'
                : 'bg-dark-600 text-gray-300 hover:bg-red-900/30 border-2 border-transparent'
            }`}
          >
            <ThumbsDown className={`mr-2 h-5 w-5 ${!liked ? 'fill-white' : ''}`} />
            Not Recommended
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-300 mb-2">
          Review Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-dark-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Summarize your thoughts..."
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="text" className="block text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 bg-dark-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
          placeholder="Share your detailed opinion..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-dark-600 text-gray-300 rounded-md hover:bg-dark-500 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {initialReview.title ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;