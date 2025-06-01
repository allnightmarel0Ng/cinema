import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '../types/api.ts';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Use fallback image if no poster is available
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster+Available';

  return (
    <Link to={`/movies/${movie.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <div className="aspect-[2/3] bg-dark-700">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Poster+Available';
            }}
          />
        </div>
        
        {/* Overlay with info on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{movie.title}</h3>
          
          <div className="flex items-center">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm">
                {movie.vote_average ? movie.vote_average.toFixed(1) : movie.tmdb_vote_average.toFixed(1)}
              </span>
            </div>
            <span className="mx-2 text-xs text-gray-400">•</span>
            <span className="text-sm text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;