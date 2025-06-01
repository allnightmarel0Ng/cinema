package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type Reviews interface {
	GetByMovieID(ctx context.Context, movieID int) ([]entities.Review, error)
	GetByUserID(ctx context.Context, userID int) ([]entities.Review, error)
	CreateOrUpdateReview(ctx context.Context, review entities.Review) error
	DeleteReview(ctx context.Context, userID, movieID int) error
}
