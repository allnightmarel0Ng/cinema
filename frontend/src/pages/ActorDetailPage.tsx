import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.ts';
import { Actor, Movie } from '../types/api.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import MovieCard from '../components/MovieCard.tsx';
import { UserRound } from 'lucide-react';

const ActorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actor, setActor] = useState<Actor | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchActorDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const actorData = await apiService.getActor(parseInt(id, 10));
        setActor(actorData);
        
        // Normally we would fetch the actor's movies here, but the API doesn't provide this endpoint
        // For demonstration, we'll use a placeholder for now
        // In a real application, you would have an endpoint like /actors/{id}/movies
        setMovies([]);
      } catch (err) {
        setError('Failed to fetch actor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Actor not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const profileUrl = actor.profile_path 
    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` 
    : null;

  const genderText = actor.gender === 1 ? 'Female' : actor.gender === 2 ? 'Male' : 'Not specified';

  return (
    <div className="bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actor Profile Header */}
        <div className="bg-dark-800 rounded-lg overflow-hidden shadow-xl mb-8">
          <div className="md:flex">
            {/* Actor Image */}
            <div className="md:w-1/3 lg:w-1/4">
              {profileUrl ? (
                <img 
                  src={profileUrl} 
                  alt={actor.name}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image+Available';
                  }}
                />
              ) : (
                <div className="bg-dark-700 h-full min-h-[300px] flex items-center justify-center">
                  <UserRound size={64} className="text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Actor Info */}
            <div className="p-6 md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl font-bold text-white mb-4">{actor.name}</h1>
              
              <div className="mb-6">
                <div className="flex items-center text-gray-300 mb-2">
                  <span className="font-medium mr-2">Gender:</span>
                  <span>{genderText}</span>
                </div>
                
                {/* Additional actor info would go here if available from API */}
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-white mb-2">Biography</h2>
                <p className="text-gray-300">
                  {/* The API doesn't provide a biography field, so using placeholder text */}
                  Biographical information not available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Filmography</h2>
          
          {/* This would ideally show movies the actor has appeared in */}
          {/* Since our API doesn't directly provide this, we're showing a placeholder message */}
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-dark-800 rounded-lg">
              <p className="text-gray-300">No movie information available for this actor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActorDetailPage;