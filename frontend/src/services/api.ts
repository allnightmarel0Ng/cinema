import axios, { AxiosInstance } from 'axios';
import { Movie, Actor, Review, User, AuthResponse } from '../types/api.ts';

const API_URL = 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  public async register(username: string, password: string): Promise<void> {
    await this.api.post('/register', { username, password });
  }

  public async login(username: string, password: string): Promise<AuthResponse> {
    // Формируем строку для кодирования
    const credentials = `${username}:${password}`;

    // Кодируем в Base64 (для браузера и Node.js 18+)
    const encodedCredentials = btoa(credentials);

    // Отправляем запрос с заголовком Authorization
    const response = await this.api.post<AuthResponse>(
        '/login',
        null, // Убираем тело запроса
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`
          }
        }
    );

    return response.data;
  }

  public async logout(): Promise<void> {
    await this.api.post('/logout');
  }

  // Movie endpoints
  public async getMovie(id: number): Promise<Movie> {
    const response = await this.api.get<Movie>(`/movies/${id}`);
    return response.data;
  }

  public async searchMovies(prompt: string): Promise<Movie[]> {
    const response = await this.api.get<Movie[]>('/movies/search', {
      params: { prompt },
    });
    return response.data;
  }

  public async getPopularMovies(page: number = 1, size: number = 20): Promise<Movie[]> {
    const response = await this.api.get<Movie[]>('/movies/popular', {
      params: { page, size },
    });
    return response.data;
  }

  // Actor endpoints
  public async getActor(id: number): Promise<Actor> {
    const response = await this.api.get<Actor>(`/actors/${id}`);
    return response.data;
  }

  public async searchActors(prompt: string): Promise<Actor[]> {
    const response = await this.api.get<Actor[]>('/actors/search', {
      params: { prompt },
    });
    return response.data;
  }

  // Review endpoints
  public async getMovieReviews(movieId: number): Promise<Review[]> {
    const response = await this.api.get<Review[]>(`/reviews/${movieId}`);
    return response.data;
  }

  public async createOrUpdateReview(movieId: number, review: { liked: boolean; title: string; text: string }): Promise<void> {
    await this.api.post(`/reviews/${movieId}`, review);
  }

  public async deleteReview(movieId: number): Promise<void> {
    await this.api.delete(`/reviews/${movieId}`);
  }

  // Rating endpoints
  public async rateMovie(movieId: number, rating: number): Promise<void> {
    await this.api.post('/rating', null, {
      params: { movie_id: movieId, rating },
    });
  }

  public async deleteRating(movieId: number): Promise<void> {
    await this.api.delete('/rating', {
      params: { movie_id: movieId },
    });
  }

  // User endpoints
  public async getUserProfile(id: number): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();