import React from 'react';
import { Link } from 'react-router-dom';
import { Actor } from '../types/api.ts';

interface ActorCardProps {
  actor: Actor;
}

const ActorCard: React.FC<ActorCardProps> = ({ actor }) => {
  // Use fallback image if no profile image is available
  const profileUrl = actor.profile_path 
    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` 
    : 'https://via.placeholder.com/300x450?text=No+Image+Available';

  return (
    <Link to={`/actors/${actor.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <div className="aspect-[2/3] bg-dark-700">
          <img
            src={profileUrl}
            alt={actor.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image+Available';
            }}
          />
        </div>
        
        {/* Overlay with name on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
          <h3 className="font-medium text-white text-center">{actor.name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default ActorCard;