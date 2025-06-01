// mock/ApiService.ts
import {
    Movie,
    Actor,
    Review,
    User,
    Rating,
    Genre,
    AuthResponse,
} from '../types/api';

/* ------------------------------------------------------------------ */
/*                  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ / ТИПЫ                    */
/* ------------------------------------------------------------------ */

function nextId<T extends { id: number }>(arr: T[]): number {
    return arr.length ? Math.max(...arr.map((e) => e.id)) + 1 : 1;
}

function delay(ms = 150) {
    return new Promise((r) => setTimeout(r, ms));
}

/* rating + user_id – внутренний тип, наружу отдаём Rating            */
interface InternalRating extends Rating {
    user_id: number;
}

/* ------------------------------------------------------------------ */
/*                          INITIAL SEED                              */
/* ------------------------------------------------------------------ */

/* ───── Genres ───── */
const genres: Genre[] = [
    { id: 1, name: 'Drama' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Sci-Fi' },
    { id: 4, name: 'Thriller' },
];

/* ───── Actors ───── */
const actors: Actor[] = [
    { id: 1, name: 'Tom Hanks',   gender: 2, profile_path: '/img/hanks.jpg' },
    { id: 2, name: 'Emma Watson', gender: 1, profile_path: '/img/emma.jpg' },
    { id: 3, name: 'Keanu Reeves',gender: 2, profile_path: '/img/keanu.jpg' },
];

/* ───── Movies ───── */

const movies: Movie[] = [
    {
        id: 1,
        tmdb_id: 13,
        title: 'Forrest Gump',
        overview: 'Life is like a box of chocolates…',
        stream_link: 'https://vk.com/video-220018529_456243272',
        release_date: '1994-07-06',
        poster_path: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Ffilmix.my%2Ffilm%2Fdrama%2F1567-v-forest-gamp-italia-1994.html&psig=AOvVaw2A654-ZvV1qJFS7XuAeJqh&ust=1748873594397000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPjHwfyz0I0DFQAAAAAdAAAAABAE',
        tmdb_vote_average: 8.8,
        tmdb_vote_count: 20000,
        vote_average: 0,        // будет пересчитан после сидов vote_count: 0,
        vote_count : 0,
        adult: false,
        revenue: 678_000_000,
        genres: [genres[0], genres[1]],
        actors: [actors[0]]
    },
    {
        id: 2,
        tmdb_id: 603,
        title: 'The Matrix',
        overview: 'Welcome to the real world.',
        stream_link: 'https://example.com/matrix',
        release_date: '1999-03-31',
        poster_path: '/img/matrix.jpg',
        tmdb_vote_average: 8.7,
        tmdb_vote_count: 24000,
        vote_average: 0,
        vote_count: 0,
        adult: false,
        revenue: 463_000_000,
        genres: [genres[3], genres[2]],
        actors: [actors[2]],
    },
];

/* ───── Users ───── */
const users: User[] = [
    { id: 1, login: 'john',  reviews: [], ratings: [] },
    { id: 2, login: 'alice', reviews: [], ratings: [] },
];

/* ───── Reviews ───── */
let reviews: Review[] = [
    {
        user_id: 1,
        movie_id: 1,
        liked: true,
        title: 'Лучший фильм детства',
        text:  'Пересматриваю каждый год – неизменно трогает.',
    },
    {
        user_id: 2,
        movie_id: 2,
        liked: true,
        title: 'Всё ещё актуален',
        text:  'Философия + экшен = ❤. Советую всем.',
    },
];

/* ───── Ratings ───── */
let ratings: InternalRating[] = [
    { user_id: 1, movie_id: 1, rating: 9 },
    { user_id: 2, movie_id: 2, rating: 10 },
];

/* заполняем user.reviews / user.ratings и агрегируем статистику фильмов */
function hydrate(): void {
    users.forEach(u => {
        u.reviews = reviews.filter(r => r.user_id === u.id);
        u.ratings = ratings .filter(r => r.user_id === u.id)
            .map(({ movie_id, rating }) => ({ movie_id, rating }));
    });

    movies.forEach(m => {
        const movieRatings = ratings.filter(r => r.movie_id === m.id);
        m.vote_count   = movieRatings.length;
        m.vote_average = movieRatings.length
            ? +(movieRatings.reduce((s, r) => s + r.rating, 0) / movieRatings.length).toFixed(1)
            : 0;
    });
}
hydrate();

/* ------------------------------------------------------------------ */
/*                        MOCK ApiService                             */
/* ------------------------------------------------------------------ */

class ApiService {
    /* ------------- simulate network latency ------------------------- */
    private async withLatency<T>(fn: () => T): Promise<T> {
        await delay();
        return fn();
    }

    /* ------------------------------ AUTH ----------------------------- */
    async register(username: string, _password: string): Promise<void> {
        return this.withLatency(() => {
            if (users.some(u => u.login === username)) throw { error: 'User already exists' };
            users.push({ id: nextId(users), login: username, reviews: [], ratings: [] });
        });
    }

    async login(username: string, _password: string): Promise<AuthResponse> {
        return this.withLatency(() => {
            const user = users.find(u => u.login === username);
            if (!user) throw { error: 'User not found' };
            localStorage.setItem('token', `mock-${user.id}`);
            return { token: `mock-${user.id}` };
        });
    }

    async logout(): Promise<void> {
        return this.withLatency(() => localStorage.removeItem('token'));
    }

    /* ------------------------------ MOVIES -------------------------- */
    async getMovie(id: number): Promise<Movie> {
        return this.withLatency(() => {
            const m = movies.find(m => m.id === id);
            if (!m) throw { error: 'Movie not found' };
            return m;
        });
    }

    async searchMovies(prompt: string): Promise<Movie[]> {
        return this.withLatency(() => {
            if (!prompt) return movies;
            const q = prompt.toLowerCase();
            return movies.filter(m => m.title.toLowerCase().includes(q));
        });
    }

    async getPopularMovies(page = 1, size = 20): Promise<Movie[]> {
        return this.withLatency(() => movies.slice((page - 1) * size, page * size));
    }

    /* ------------------------------ ACTORS -------------------------- */
    async getActor(id: number): Promise<Actor> {
        return this.withLatency(() => {
            const a = actors.find(a => a.id === id);
            if (!a) throw { error: 'Actor not found' };
            return a;
        });
    }

    async searchActors(prompt: string): Promise<Actor[]> {
        return this.withLatency(() => {
            if (!prompt) return actors;
            const q = prompt.toLowerCase();
            return actors.filter(a => a.name.toLowerCase().includes(q));
        });
    }

    /* ------------------------------ REVIEWS ------------------------- */
    async getMovieReviews(movieId: number): Promise<Review[]> {
        return this.withLatency(() => reviews.filter(r => r.movie_id === movieId));
    }

    async createOrUpdateReview(
        movieId: number,
        data: { liked: boolean; title: string; text: string }
    ): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const userId = +token.split('-').at(-1)!;

            const newReview: Review = { ...data, movie_id: movieId, user_id: userId };
            const idx = reviews.findIndex(r => r.movie_id === movieId && r.user_id === userId);
            idx >= 0 ? (reviews[idx] = newReview) : reviews.push(newReview);

            /* синхронизация user.reviews */
            const user = users.find(u => u.id === userId)!;
            const idxU = user.reviews.findIndex(r => r.movie_id === movieId);
            idxU >= 0 ? (user.reviews[idxU] = newReview) : user.reviews.push(newReview);
        });
    }

    async deleteReview(movieId: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const userId = +token.split('-').at(-1)!;

            reviews = reviews.filter(r => !(r.movie_id === movieId && r.user_id === userId));
            const user = users.find(u => u.id === userId)!;
            user.reviews = user.reviews.filter(r => r.movie_id !== movieId);
        });
    }

    /* ------------------------------ RATINGS ------------------------- */
    async rateMovie(movieId: number, rating: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const userId = +token.split('-').at(-1)!;

            const idx = ratings.findIndex(r => r.movie_id === movieId && r.user_id === userId);
            if (idx >= 0) ratings[idx].rating = rating;
            else ratings.push({ movie_id: movieId, rating, user_id: userId });

            /* user.ratings sync */
            const user = users.find(u => u.id === userId)!;
            const idxU = user.ratings.findIndex(r => r.movie_id === movieId);
            idxU >= 0 ? (user.ratings[idxU].rating = rating) : user.ratings.push({ movie_id: movieId, rating });

            /* пересчёт агрегатов фильма */
            const movie = movies.find(m => m.id === movieId)!;
            const movieRatings = ratings.filter(r => r.movie_id === movieId);
            movie.vote_count   = movieRatings.length;
            movie.vote_average = +(movieRatings.reduce((s, r) => s + r.rating, 0) / movieRatings.length).toFixed(1);
        });
    }

    async deleteRating(movieId: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const userId = +token.split('-').at(-1)!;

            ratings = ratings.filter(r => !(r.movie_id === movieId && r.user_id === userId));
            const user = users.find(u => u.id === userId)!;
            user.ratings = user.ratings.filter(r => r.movie_id !== movieId);

            /* пересчёт агрегатов фильма */
            const movie = movies.find(m => m.id === movieId)!;
            const movieRatings = ratings.filter(r => r.movie_id === movieId);
            movie.vote_count   = movieRatings.length;
            movie.vote_average = movieRatings.length
                ? +(movieRatings.reduce((s, r) => s + r.rating, 0) / movieRatings.length).toFixed(1)
                : 0;
        });
    }

    /* ------------------------------ USERS --------------------------- */
    async getUserProfile(id: number): Promise<User> {
        return this.withLatency(() => {
            const u = users.find(u => u.id === id);
            if (!u) throw { error: 'User not found' };
            return u;
        });
    }
}

/* Экспортируем с тем же именем, что и настоящий сервис */
export const apiService = new ApiService();