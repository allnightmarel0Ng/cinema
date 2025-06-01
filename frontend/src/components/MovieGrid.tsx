import React from 'react';
import { Movie } from '../types/api.ts';
import MovieCard from './MovieCard.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  error?: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-2">{error}</p>
        <p className="text-gray-400">Please try again later.</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-300 text-lg">No movies found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;