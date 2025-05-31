// src/api/movies.ts (добавляем функции поиска)
import axios from 'axios';
import {API_URL} from "./config";

export interface MovieSearchResult {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
}

export interface ActorSearchResult {
    id: number;
    name: string;
    character?: string;
    profile_path: string | null;
}

export const searchMovies = async (query: string): Promise<MovieSearchResult[]> => {
    const response = await axios.get(`${API_URL}/movies/search`, {
        params: { prompt: query }
    });
    return response.data;
};

export const searchActors = async (query: string): Promise<ActorSearchResult[]> => {
    const response = await axios.get(`${API_URL}/actors/search`, {
        params: { prompt: query }
    });
    return response.data;
};