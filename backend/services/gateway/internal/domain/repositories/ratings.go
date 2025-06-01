package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type Ratings interface {
	CreateRating(ctx context.Context, rating entities.Rating) error
	DeleteRating(ctx context.Context, userID, movieID int) (float32, error)
	GetUserRatings(ctx context.Context, userID int) ([]entities.Rating, error)
	GetMovieRatings(ctx context.Context, movieID int) ([]entities.Rating, error)
}
