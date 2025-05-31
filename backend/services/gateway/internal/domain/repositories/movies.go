package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type Movies interface {
	InsertMovies(ctx context.Context, movies []entities.Movie) error
}
