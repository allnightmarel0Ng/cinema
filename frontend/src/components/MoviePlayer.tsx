import React from 'react';
import { X } from 'lucide-react';

interface MoviePlayerProps {
  streamUrl: string;
  onClose: () => void;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ streamUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl mx-auto p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          aria-label="Close player"
        >
          <X size={24} />
        </button>
        
        <div className="w-full h-full flex items-center justify-center">
          <iframe
            src={streamUrl}
            className="w-full h-full max-h-[80vh] rounded-lg shadow-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer;