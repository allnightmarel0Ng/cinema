package clients

import (
	"context"
	"time"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
)

type TMDB interface {
	// FetchMovies fetches movies from TMDB based on the provided tickrate
	// starting from the given startID and with a specified size.
	// It returns a channel that emits slices of Movie entities.
	FetchMovies(ctx context.Context, startID int64, size int, tickrate time.Duration) <-chan []entities.Movie
}
