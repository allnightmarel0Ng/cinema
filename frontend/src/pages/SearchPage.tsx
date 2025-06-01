import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.ts';
// import {apiService} from "../services/mockApi.ts";
import { Movie, Actor } from '../types/api.ts';
import MovieGrid from '../components/MovieGrid.tsx';
import ActorCard from '../components/ActorCard.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { Film, User } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'actors'>('movies');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Search for both movies and actors in parallel
        const [moviesData, actorsData] = await Promise.all([
          apiService.searchMovies(query),
          apiService.searchActors(query)
        ]);
        
        setMovies(moviesData);
        setActors(actorsData);
        
        // Set active tab based on which has more results
        if (moviesData.length === 0 && actorsData.length > 0) {
          setActiveTab('actors');
        } else {
          setActiveTab('movies');
        }
      } catch (err) {
        setError('Failed to perform search');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  const totalResults = movies.length + actors.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Search Results: "{query}"
        </h1>
        <p className="text-gray-400">
          {totalResults} {totalResults === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="bg-dark-800 rounded-lg p-8 text-center">
          <p className="text-xl text-gray-300 mb-4">No results found for "{query}"</p>
          <p className="text-gray-400">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-dark-700 mb-6">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('movies')}
                className={`flex items-center py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'movies'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                <Film className="h-5 w-5 mr-2" />
                Movies ({movies.length})
              </button>
              <button
                onClick={() => setActiveTab('actors')}
                className={`flex items-center py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'actors'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Actors ({actors.length})
              </button>
            </div>
          </div>

          {/* Results */}
          {activeTab === 'movies' ? (
            <MovieGrid movies={movies} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {actors.map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;