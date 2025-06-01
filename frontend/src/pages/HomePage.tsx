import React, { useState, useEffect } from 'react';
import { apiService } from '../services/mockApi.ts';
import { Movie } from '../types/api.ts';
import MovieGrid from '../components/MovieGrid.tsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getPopularMovies(page);
        setMovies(data);
        setHasMore(data.length === 20); // Assuming 20 is the page size
      } catch (err) {
        setError('Failed to fetch popular movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Popular Movies</h1>
        <p className="text-gray-400">Discover the most popular movies right now</p>
      </div>

      <MovieGrid movies={movies} loading={loading} error={error || undefined} />

      {/* Pagination controls */}
      {!loading && !error && movies.length > 0 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className={`flex items-center px-4 py-2 rounded-md ${
              page === 1
                ? 'bg-dark-600 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors`}
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>
          <span className="px-4 py-2 bg-dark-700 text-white rounded-md">
            Page {page}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className={`flex items-center px-4 py-2 rounded-md ${
              !hasMore
                ? 'bg-dark-600 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors`}
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;