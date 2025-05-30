package repositories

import (
	"context"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
)

type Movies interface {
	InsertMovie(ctx context.Context, movie *entities.Movie) error
	GetMaxID(ctx context.Context) (int64, error)
}
