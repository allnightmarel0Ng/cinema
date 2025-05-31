// src/api/movies.ts
import axios from "axios";
import { API_URL } from "./config";


export interface Movie {  // Добавляем export перед интерфейсом
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    genres: { id: number; name: string }[];
    actors?: {
        id: number;
        name: string;
        profile_path: string | null;
    }[];
}

export const getMovieReviews = async (movieId: number): Promise<Review[]> => {
    try {
        const response = await axios.get(`${API_URL}/reviews/${movieId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching reviews for movie ${movieId}:`, error);
        throw error;
    }
};

interface Review {
    id: number;
    author: string;
    content: string;
    rating: number;
    created_at: string;
    user_id: number;
}

type PaginatedMovies = {
    page: number;
    results: Movie[];
    total_pages: number;
};

/**
 * Получить фильм по ID
 */
export const getMovieById = async (id: number): Promise<Movie> => {
    try {
        const response = await axios.get(`${API_URL}/movies/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при загрузке фильма ${id}:`, error);
        throw error;
    }
};

/**
 * Поиск фильмов по названию
 */
export const searchMovies = async (query: string): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/movies/search?prompt=${query}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка поиска по запросу "${query}":`, error);
        throw error;
    }
};

/**
 * Получить популярные фильмы (с пагинацией)
 */
export const getPopularMovies = async (
    page: number = 1,
    size: number = 20
): Promise<PaginatedMovies> => {
    try {
        const response = await axios.get(
            `${API_URL}/movies/popular?page=${page}&size=${size}`
        );
        return {
            page,
            results: response.data,
            total_pages: Math.ceil(response.headers["x-total-count"] / size),
        };
    } catch (error) {
        console.error("Ошибка загрузки популярных фильмов:", error);
        throw error;
    }
};