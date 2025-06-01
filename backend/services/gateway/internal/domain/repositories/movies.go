package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type Movies interface {
	GetByID(ctx context.Context, id int) (entities.Movie, error)
	SearchByTitle(ctx context.Context, title string) ([]entities.Movie, error)
	GetPopular(ctx context.Context, offset, limit int) ([]entities.Movie, error)
	InsertMovies(ctx context.Context, movies []entities.Movie) error
	AddVote(ctx context.Context, movieID int, newValue float32) error
	DeleteVote(ctx context.Context, movieID int, oldValue float32) error
}
