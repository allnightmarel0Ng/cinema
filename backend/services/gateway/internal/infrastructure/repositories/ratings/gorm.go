package ratings

import (
	"context"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type gormRatings struct {
	db      *gorm.DB
	timeout time.Duration
}

func NewGORMRepository(db *gorm.DB, timeout time.Duration) repositories.Ratings {
	return &gormRatings{db: db, timeout: timeout}
}

func (gr *gormRatings) CreateRating(ctx context.Context, rating entities.Rating) error {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	return gr.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "user_id"},
				{Name: "movie_id"},
			},
			DoUpdates: clause.AssignmentColumns([]string{"rating"}),
		}).
		Create(&rating).Error
}

func (gr *gormRatings) DeleteRating(ctx context.Context, userID, movieID int) (float32, error) {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	rating := &entities.Rating{}

	err := gr.db.WithContext(ctx).
		Where("user_id = ? AND movie_id = ?", userID, movieID).
		Delete(rating).Error

	return rating.Rating, err
}

func (gr *gormRatings) GetUserRatings(ctx context.Context, userID int) ([]entities.Rating, error) {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	var ratings []entities.Rating
	err := gr.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&ratings).Error
	return ratings, err
}

func (gr *gormRatings) GetMovieRatings(ctx context.Context, movieID int) ([]entities.Rating, error) {
	ctx, cancel := context.WithTimeout(ctx, gr.timeout)
	defer cancel()

	var ratings []entities.Rating
	err := gr.db.WithContext(ctx).
		Where("movie_id = ?", movieID).
		Find(&ratings).Error
	return ratings, err
}
