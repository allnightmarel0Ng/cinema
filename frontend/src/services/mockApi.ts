// mock/ApiService.ts
import type {
    Movie,
    Actor,
    Review,
    User,
    Rating,
    Genre,
    AuthResponse,
} from '../types/api';

/* ────────── helpers ────────── */
const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

/* ────────── внутренние типы ────────── */
interface InternalUser extends User {
    password: string;
}
interface InternalRating extends Rating {
    username: string;
}

/* ────────── сидовые данные ────────── */
const genres: Genre[] = [
    { id: 1, name: 'Drama' },   { id: 2, name: 'Comedy' },
    { id: 3, name: 'Sci-Fi' },  { id: 4, name: 'Thriller' },
];

const actors: Actor[] = [
    { id: 1, name: 'Tom Hanks',          gender: 2, profile_path: '/img/hanks.jpg' },
    { id: 2, name: 'Emma Watson',        gender: 1, profile_path: '/img/emma.jpg' },
    { id: 3, name: 'Keanu Reeves',       gender: 2, profile_path: '/img/keanu.jpg' },
    { id: 4, name: 'Carrie-Anne Moss',   gender: 1, profile_path: '/img/carrie.jpg' },
    { id: 5, name: 'Laurence Fishburne', gender: 2, profile_path: '/img/fish.jpg' },
];

const movies: Movie[] = [
    {
        id: 1,
        tmdb_id: 13,
        title: 'Forrest Gump',
        overview: 'Life is like a box of chocolates…',
        stream_link: 'https://vk.com/video-220018529_456243272',
        release_date: '1994-07-06',
        poster_path: '/img/forrest.jpg',
        tmdb_vote_average: 8.8,
        tmdb_vote_count: 20000,
        vote_average: 0,
        vote_count: 0,
        adult: false,
        revenue: 678_000_000,
        genres: [genres[0], genres[1]],
        actors: [actors[0]],
    },
    {
        id: 2,
        tmdb_id: 603,
        title: 'The Matrix',
        overview: 'Welcome to the real world.',
        stream_link: 'https://vidsrc.xyz/embed/603',
        release_date: '1999-03-31',
        poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        tmdb_vote_average: 8.7,
        tmdb_vote_count: 24000,
        vote_average: 0,
        vote_count: 0,
        adult: false,
        revenue: 463_000_000,
        genres: [genres[3], genres[2]],
        actors: [actors[2], actors[4], actors[3]],
    },
];

const users: InternalUser[] = [
    { username: 'john',  password: '123',    reviews: [], ratings: [] },
    { username: 'alice', password: 'qwerty', reviews: [], ratings: [] },
];

let reviews: Review[] = [
    {
        user_id: 1,
        user_name: 'john',
        movie_id: 1,
        liked: true,
        title: 'Лучший фильм',
        text:  'Смотрю каждый год.',
    },
    {
        user_id: 2,
        user_name: 'alice',
        movie_id: 2,
        liked: true,
        title: 'Культовый',
        text:  'Философия + экшен = ♥',
    },
];

let ratings: InternalRating[] = [
    { username: 'john',  movie_id: 1, rating: 9  },
    { username: 'alice', movie_id: 2, rating: 10 },
];

/* ────────── агрегация статистики ────────── */
function hydrate() {
    users.forEach(u => {
        u.reviews = reviews.filter(r => r.user_name === u.username);
        u.ratings = ratings
            .filter(r => r.username === u.username)
            .map(({ movie_id, rating }) => ({ movie_id, rating }));
    });

    movies.forEach(m => {
        const mr = ratings.filter(r => r.movie_id === m.id);
        m.vote_count   = mr.length;
        m.vote_average = mr.length ? +(mr.reduce((s, r) => s + r.rating, 0) / mr.length).toFixed(1) : 0;
    });
}
hydrate();

/* ────────── сервис ────────── */
class ApiService {
    private async withLatency<T>(fn: () => T): Promise<T> {
        await delay(); return fn();
    }

    /* ---------- AUTH ---------- */
    async register(username: string, password: string): Promise<void> {
        return this.withLatency(() => {
            if (users.some(u => u.username === username))
                throw { error: 'User already exists' };
            users.push({ username, password, reviews: [], ratings: [] });
        });
    }

    async login(username: string, password: string): Promise<AuthResponse> {
        return this.withLatency(() => {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) throw { error: 'Bad credentials' };
            const token = `mock-${username}`;
            localStorage.setItem('token', token);
            const user_id = 1
            return {user_id, token };
        });
    }

    async logout(): Promise<void> {
        return this.withLatency(() => localStorage.removeItem('token'));
    }

    /* ---------- MOVIES ---------- */
    async getMovie(id: number): Promise<Movie> {
        return this.withLatency(() => {
            const m = movies.find(m => m.id === id);
            if (!m) throw { error: 'Movie not found' };
            return { ...m };
        });
    }

    async searchMovies(prompt: string): Promise<Movie[]> {
        return this.withLatency(() => {
            const list = prompt
                ? movies.filter(m => m.title.toLowerCase().includes(prompt.toLowerCase()))
                : movies;
            return list.map(m => ({ ...m }));
        });
    }

    async getPopularMovies(page = 1, size = 20): Promise<Movie[]> {
        return this.withLatency(() =>
            movies.slice((page - 1) * size, page * size).map(m => ({ ...m }))
        );
    }

    /* ---------- ACTORS ---------- */
    async getActor(id: number): Promise<Actor> {
        return this.withLatency(() => {
            const a = actors.find(a => a.id === id);
            if (!a) throw { error: 'Actor not found' };
            return { ...a };
        });
    }

    async searchActors(prompt: string): Promise<Actor[]> {
        return this.withLatency(() => {
            const list = prompt
                ? actors.filter(a => a.name.toLowerCase().includes(prompt.toLowerCase()))
                : actors;
            return list.map(a => ({ ...a }));
        });
    }

    /* ---------- REVIEWS ---------- */
    async getMovieReviews(movieId: number): Promise<Review[]> {
        return this.withLatency(() =>
            reviews.filter(r => r.movie_id === movieId).map(r => ({ ...r }))
        );
    }

    async createOrUpdateReview(
        movieId: number,
        data: { liked: boolean; title: string; text: string }
    ): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const username = token.replace('mock-', '');

            const newReview: Review = { ...data,user_id : 1, movie_id: movieId, user_name: username };
            const idx = reviews.findIndex(r => r.movie_id === movieId && r.user_name === username);
            idx >= 0 ? (reviews[idx] = newReview) : reviews.push(newReview);

            const user = users.find(u => u.username === username)!;
            const idxU = user.reviews.findIndex(r => r.movie_id === movieId);
            idxU >= 0 ? (user.reviews[idxU] = newReview) : user.reviews.push(newReview);
        });
    }

    async deleteReview(movieId: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const username = token.replace('mock-', '');

            reviews = reviews.filter(r => !(r.movie_id === movieId && r.user_name === username));
            const user = users.find(u => u.username === username)!;
            user.reviews = user.reviews.filter(r => r.movie_id !== movieId);
        });
    }

    /* ---------- RATINGS ---------- */
    async rateMovie(movieId: number, rating: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const username = token.replace('mock-', '');

            const idx = ratings.findIndex(r => r.movie_id === movieId && r.username === username);
            idx >= 0 ? (ratings[idx].rating = rating)
                : ratings.push({ movie_id: movieId, rating, username });

            const user = users.find(u => u.username === username)!;
            const idxU = user.ratings.findIndex(r => r.movie_id === movieId);
            idxU >= 0 ? (user.ratings[idxU].rating = rating)
                : user.ratings.push({ movie_id: movieId, rating });

            const movie = movies.find(m => m.id === movieId)!;
            const mr = ratings.filter(r => r.movie_id === movieId);
            movie.vote_count = mr.length;
            movie.vote_average = +(mr.reduce((s, r) => s + r.rating, 0) / mr.length).toFixed(1);
        });
    }

    async deleteRating(movieId: number): Promise<void> {
        return this.withLatency(() => {
            const token = localStorage.getItem('token');
            if (!token) throw { error: 'Unauthorized' };
            const username = token.replace('mock-', '');

            ratings = ratings.filter(r => !(r.movie_id === movieId && r.username === username));
            const user = users.find(u => u.username === username)!;
            user.ratings = user.ratings.filter(r => r.movie_id !== movieId);

            const movie = movies.find(m => m.id === movieId)!;
            const mr = ratings.filter(r => r.movie_id === movieId);
            movie.vote_count   = mr.length;
            movie.vote_average = mr.length
                ? +(mr.reduce((s, r) => s + r.rating, 0) / mr.length).toFixed(1)
                : 0;
        });
    }

    /* ---------- USERS ---------- */
    async getUserProfile(username: string): Promise<User> {
        return this.withLatency(() => {
            const u = users.find(u => u.username === username);
            if (!u) throw { error: 'User not found' };
            const { password, ...safe } = u;      // пароль наружу не отдаём
            return { ...safe };
        });
    }
}

/* singleton с тем же именем, что и настоящий сервис */
export const apiService = new ApiService();