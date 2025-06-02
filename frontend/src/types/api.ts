export interface Genre {
  id: number;
  name: string;
}

export interface Actor {
  id: number;
  name: string;
  gender: number;
  profile_path: string;
}

export interface Review {
  user_id: number;
  user_name: string;
  movie_id: number;
  liked: boolean;
  title: string;
  text: string;
}

export interface Rating {
  movie_id: number;
  rating: number;
}

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  stream_link: string;
  release_date: string;
  poster_path: string;
  tmdb_vote_average: number;
  tmdb_vote_count: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  revenue: number;
  genres: Genre[];
  actors: Actor[];
}

export interface User {
  username: string;
  reviews: Review[];
  ratings: Rating[];
}

export interface AuthResponse {
  id: number;
  token: string;
}

export interface ApiError {
  error: string;
}