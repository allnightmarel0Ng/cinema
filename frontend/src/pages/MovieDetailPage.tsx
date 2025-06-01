import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { apiService } from '../services/api.ts';
import {apiService} from "../services/mockApi.ts";
import { Movie, Review } from '../types/api.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import StarRating from '../components/StarRating.tsx';
import ReviewItem from '../components/ReviewItem.tsx';
import ReviewForm from '../components/ReviewForm.tsx';
import ActorCard from '../components/ActorCard.tsx';
import MoviePlayer from '../components/MoviePlayer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Calendar, Ticket, Info, Plus, X, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieData = await apiService.getMovie(parseInt(id, 10));
        setMovie(movieData);
        
        const reviewsData = await apiService.getMovieReviews(parseInt(id, 10));
        setReviews(reviewsData);
        
        if (isAuthenticated && userId) {
          const userProfile = await apiService.getUserProfile(userId);
          const userRating = userProfile.ratings.find(r => r.movie_id === parseInt(id, 10));
          if (userRating) {
            setUserRating(userRating.rating);
          }
        }
      } catch (err) {
        setError('Failed to fetch movie details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, isAuthenticated, userId]);

  const userReview = userId ? reviews.find(review => review.user_id === userId) : null;

  const handleRateMovie = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate movies');
      return;
    }

    try {
      await apiService.rateMovie(parseInt(id!, 10), rating);
      setUserRating(rating);
      toast.success('Rating submitted successfully!');
      
      const updatedMovie = await apiService.getMovie(parseInt(id!, 10));
      setMovie(updatedMovie);
    } catch (err) {
      toast.error('Failed to submit rating');
      console.error(err);
    }
  };

  const handleDeleteRating = async () => {
    if (!isAuthenticated || !userRating) return;
    
    try {
      await apiService.deleteRating(parseInt(id!, 10));
      setUserRating(null);
      toast.success('Rating removed successfully!');
      
      const updatedMovie = await apiService.getMovie(parseInt(id!, 10));
      setMovie(updatedMovie);
    } catch (err) {
      toast.error('Failed to remove rating');
      console.error(err);
    }
  };

  const handleReviewSubmit = async (reviewData: { title: string; text: string; liked: boolean }) => {
    if (!isAuthenticated) {
      toast.error('Please login to review movies');
      return;
    }

    try {
      await apiService.createOrUpdateReview(parseInt(id!, 10), reviewData);
      
      const updatedReviews = await apiService.getMovieReviews(parseInt(id!, 10));
      setReviews(updatedReviews);
      
      setShowReviewForm(false);
      setEditingReview(null);
      toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit review');
      console.error(err);
    }
  };

  const handleDeleteReview = async () => {
    if (!isAuthenticated || !userReview) return;
    
    try {
      await apiService.deleteReview(parseInt(id!, 10));
      setReviews(reviews.filter(review => review.user_id !== userId));
      toast.success('Review deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete review');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Movie not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const backdropUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}` 
    : null;
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

  return (
    <>
      {isPlaying && movie.stream_link && (
        <MoviePlayer 
          streamUrl={movie.stream_link} 
          onClose={() => setIsPlaying(false)} 
        />
      )}
      
      <div className="bg-dark-900 min-h-screen">
        <div 
          className="relative w-full h-[50vh] md:h-[60vh] bg-dark-800 overflow-hidden"
        >
          {backdropUrl && (
            <div className="absolute inset-0">
              <img 
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
            </div>
          )}
          
          <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-48 md:w-64 lg:w-72 flex-shrink-0 mb-6 md:mb-0 md:ml-8 z-10 rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={posterUrl}
                alt={movie.title}
                className="w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Poster+Available';
                }}
              />
            </div>
            
            <div className="md:ml-8 text-white z-10 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
              
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <StarRating 
                    initialRating={movie.vote_average / 2}
                    maxRating={5}
                    readOnly
                    size="sm"
                  />
                  <span className="ml-2">
                    {movie.vote_average ? movie.vote_average.toFixed(1) : movie.tmdb_vote_average.toFixed(1)}/10
                  </span>
                </div>
                
                {movie.release_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {movie.genres.map(genre => (
                  <span 
                    key={genre.id} 
                    className="px-3 py-1 bg-dark-600 rounded-full text-xs font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 max-w-2xl line-clamp-3 md:line-clamp-none mb-4">
                {movie.overview}
              </p>

              {movie.stream_link && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-dark-800 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Rate This Movie</h2>
                
                {!isAuthenticated ? (
                  <div className="text-center p-4 border border-dashed border-dark-600 rounded-lg">
                    <p className="text-gray-400 mb-2">Please login to rate this movie</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Login
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <StarRating 
                        initialRating={userRating || 0}
                        maxRating={10}
                        onRatingChange={handleRateMovie}
                      />
                      <p className="text-gray-400 mt-1 text-sm">
                        {userRating 
                          ? 'Your rating' 
                          : 'Click to rate'}
                      </p>
                    </div>
                    
                    {userRating && (
                      <button
                        onClick={handleDeleteRating}
                        className="px-3 py-1 bg-dark-600 text-gray-300 rounded-md hover:bg-dark-500 transition-colors text-sm flex items-center"
                      >
                        <X size={14} className="mr-1" />
                        Remove Rating
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Reviews</h2>
                  
                  {isAuthenticated && !userReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                    >
                      <Plus size={18} className="mr-1" />
                      Write a Review
                    </button>
                  )}
                </div>
                
                {isAuthenticated && (showReviewForm || editingReview) && (
                  <ReviewForm 
                    initialReview={editingReview || undefined}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                    }}
                  />
                )}
                
                {reviews.length > 0 ? (
                  <div>
                    {reviews.map((review, index) => (
                      <ReviewItem 
                        key={`${review.user_id}-${index}`}
                        review={review}
                        onEdit={() => {
                          if (review.user_id === userId) {
                            setEditingReview(review);
                          }
                        }}
                        onDelete={() => {
                          if (review.user_id === userId) {
                            handleDeleteReview();
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-dark-600 rounded-lg">
                    <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-dark-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Movie Info
                </h2>
                
                <div className="space-y-3">
                  {movie.release_date && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-sm">Release Date</p>
                        <p className="text-white">
                          {new Date(movie.release_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div className="flex items-start">
                      <Ticket className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-sm">Box Office</p>
                        <p className="text-white">
                          ${movie.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {movie.actors && movie.actors.length > 0 && (
                <div className="bg-dark-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Top Cast</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {movie.actors.slice(0, 6).map((actor) => (
                      <ActorCard key={actor.id} actor={actor} />
                    ))}
                  </div>
                  
                  {movie.actors.length > 6 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => navigate(`/movie/${id}/cast`)}
                        className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
                      >
                        View all cast
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieDetailPage;