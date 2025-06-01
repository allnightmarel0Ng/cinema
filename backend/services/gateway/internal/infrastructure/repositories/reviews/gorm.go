package reviews

import (
	"context"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"gorm.io/gorm"
)

type gormReviews struct {
	db      *gorm.DB
	timeout time.Duration
}

func NewGORMRepository(db *gorm.DB, timeout time.Duration) repositories.Reviews {
	return &gormReviews{db: db, timeout: timeout}
}

func (gr *gormReviews) GetByMovieID(ctx context.Context, movieID int) ([]entities.Review, error) {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	var reviews []entities.Review
	err := gr.db.WithContext(ctx).
		Where("movie_id = ?", movieID).
		Find(&reviews).Error
	return reviews, err
}

func (gr *gormReviews) GetByUserID(ctx context.Context, userID int) ([]entities.Review, error) {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	var reviews []entities.Review
	err := gr.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&reviews).Error
	return reviews, err
}

func (gr *gormReviews) CreateOrUpdateReview(ctx context.Context, review entities.Review) error {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	return gr.db.WithContext(ctx).Save(&review).Error
}

func (gr *gormReviews) DeleteReview(ctx context.Context, userID, movieID int) error {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	return gr.db.WithContext(ctx).
		Where("user_id = ? AND movie_id = ?", userID, movieID).
		Delete(&entities.Review{}).Error
}
