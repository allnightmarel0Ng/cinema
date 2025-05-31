import { Link } from 'react-router-dom';

interface ActorCardProps {
    actor: {
        id: number;
        name: string;
        character?: string;
        profile_path: string | null;
    };
}

export const ActorCard = ({ actor }: ActorCardProps) => {
    return (
        <Link
            to={`/actor/${actor.id}`}
            className="flex flex-col items-center text-center hover:scale-105 transition-transform"
        >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 border-2 border-gray-700">
                {actor.profile_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No photo</span>
                    </div>
                )}
            </div>
            <h3 className="font-medium text-white">{actor.name}</h3>
            {actor.character && (
                <p className="text-sm text-gray-400">{actor.character}</p>
            )}
        </Link>
    );
};