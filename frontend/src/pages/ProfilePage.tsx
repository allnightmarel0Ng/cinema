import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.ts';
// import {apiService} from "../services/mockApi.ts";
import { User, Movie } from '../types/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, userId, username } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [moviesMap, setMoviesMap] = useState<Record<number, Movie>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'ratings'>('reviews');

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/login', { replace: true });
      return;
    }
    
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userData = await apiService.getUserProfile(localStorage.getItem('user_name') as string);
        setUserProfile(userData);
        
        // Fetch movie details for all reviews and ratings
        const movieIds = new Set<number>();
        userData.reviews.forEach(review => movieIds.add(review.movie_id));
        userData.ratings.forEach(rating => movieIds.add(rating.movie_id));
        
        const moviesData: Record<number, Movie> = {};
        
        // We would normally fetch these in parallel, but to avoid rate limiting,
        // we'll fetch them sequentially
        for (const movieId of Array.from(movieIds)) {
          try {
            const movie = await apiService.getMovie(movieId);
            moviesData[movieId] = movie;
          } catch (err) {
            console.error(`Failed to fetch movie ${movieId}:`, err);
            // Continue with other movies even if one fails
          }
        }
        
        setMoviesMap(moviesData);
      } catch (err) {
        setError('Failed to fetch user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, userId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Failed to load profile'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-dark-800 rounded-lg p-8 mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{username}</h1>
          <p className="text-gray-400">
            {userProfile.reviews.length} reviews • {userProfile.ratings.length} ratings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-700 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 border-b-2 font-medium ${
              activeTab === 'reviews'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            My Reviews
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`py-3 border-b-2 font-medium ${
              activeTab === 'ratings'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            My Ratings
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'reviews' ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Reviews</h2>
          
          {userProfile.reviews.length === 0 ? (
            <div className="text-center py-10 bg-dark-800 rounded-lg">
              <p className="text-gray-300">You haven't reviewed any movies yet.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userProfile.reviews.map((review) => {
                const movie = moviesMap[review.movie_id];
                
                if (!movie) {
                  return null; // Skip if movie data couldn't be fetched
                }
                
                return (
                  <div key={review.movie_id} className="bg-dark-800 rounded-lg overflow-hidden shadow-md">
                    <div className="md:flex">
                      {/* Movie Poster */}
                      <div className="md:w-1/4 lg:w-1/5">
                        <img 
                          src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
                            : 'https://via.placeholder.com/300x450?text=No+Poster+Available'
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onClick={() => navigate(`/movies/${movie.id}`)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                      
                      {/* Review Content */}
                      <div className="p-4 md:w-3/4 lg:w-4/5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 
                            className="text-lg font-bold text-white hover:text-primary-400 transition-colors cursor-pointer"
                            onClick={() => navigate(`/movies/${movie.id}`)}
                          >
                            {movie.title}
                          </h3>
                          <div className="flex items-center">
                            {review.liked ? (
                              <ThumbsUp className="h-5 w-5 text-green-500 fill-green-500" />
                            ) : (
                              <ThumbsDown className="h-5 w-5 text-red-500 fill-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-gray-300 mb-2">{review.title}</h4>
                        <p className="text-gray-400 mb-4">{review.text}</p>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate(`/movies/${movie.id}`)}
                            className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
                          >
                            View Movie
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Ratings</h2>
          
          {userProfile.ratings.length === 0 ? (
            <div className="text-center py-10 bg-dark-800 rounded-lg">
              <p className="text-gray-300">You haven't rated any movies yet.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.ratings.map((rating) => {
                const movie = moviesMap[rating.movie_id];
                
                if (!movie) {
                  return null; // Skip if movie data couldn't be fetched
                }
                
                return (
                  <div 
                    key={rating.movie_id} 
                    className="bg-dark-800 rounded-lg overflow-hidden shadow-md flex items-center"
                  >
                    <img 
                      src={movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
                        : 'https://via.placeholder.com/300x450?text=No+Poster+Available'
                      }
                      alt={movie.title}
                      className="w-20 h-30 object-cover"
                    />
                    <div className="p-4 flex-1">
                      <h3 
                        className="font-bold text-white hover:text-primary-400 transition-colors cursor-pointer"
                        onClick={() => navigate(`/movies/${movie.id}`)}
                      >
                        {movie.title}
                      </h3>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-yellow-400 font-medium">{rating.rating}</span>
                        <span className="text-gray-400">/10</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;