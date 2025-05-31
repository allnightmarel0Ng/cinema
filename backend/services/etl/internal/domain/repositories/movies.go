package repositories

import (
	"context"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
)

type Movies interface {
	InsertMovies(ctx context.Context, movies []entities.Movie) error
}
