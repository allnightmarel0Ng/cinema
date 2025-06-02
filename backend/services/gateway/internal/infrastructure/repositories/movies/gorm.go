package movies

import (
	"context"
	"errors"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	errorwrap "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/error_wrap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type gormMovies struct {
	db      *gorm.DB
	timeout time.Duration
}

func NewGORMRepository(db *gorm.DB, timeout time.Duration) repositories.Movies {
	return &gormMovies{
		db:      db,
		timeout: timeout,
	}
}

func (gm *gormMovies) GetByID(ctx context.Context, id int) (entities.Movie, error) {
	var movie entities.Movie
	err := gm.db.WithContext(ctx).
		Preload("Genres").
		Preload("Actors").
		First(&movie, id).Error
	return movie, err
}

func (gm *gormMovies) SearchByTitle(ctx context.Context, title string) ([]entities.Movie, error) {
	var movies []entities.Movie
	err := gm.db.WithContext(ctx).
		Preload("Genres").
		Preload("Actors").
		Where("title ILIKE ?", "%"+title+"%").
		Find(&movies).Error
	return movies, err
}

func (gm *gormMovies) GetPopular(ctx context.Context, offset, limit int) ([]entities.Movie, error) {
	var movies []entities.Movie
	err := gm.db.WithContext(ctx).
		Preload("Genres").
		Preload("Actors").
		Order("the_movie_db_vote_count DESC, the_movie_db_vote_average DESC").
		Offset(offset).
		Limit(limit).
		Find(&movies).Error
	return movies, err
}

func (gm *gormMovies) InsertMovies(ctx context.Context, movies []entities.Movie) error {
	return gm.db.Transaction(func(tx *gorm.DB) error {
		ctx, cancel := context.WithTimeout(ctx, gm.timeout)
		defer cancel()

		for _, movie := range movies {
			genres := make([]entities.Genre, len(movie.Genres))
			for i, g := range movie.Genres {
				var genre entities.Genre
				if err := tx.WithContext(ctx).Where("tmdb_id = ?", g.TheMovieDBID).FirstOrCreate(&genre, entities.Genre{
					TheMovieDBID: g.TheMovieDBID,
					Name:         g.Name,
				}).Error; err != nil {
					return errorwrap.Wrap(ctx, err)
				}
				genres[i] = genre
			}

			actors := make([]entities.Actor, len(movie.Actors))
			for i, a := range movie.Actors {
				var actor entities.Actor
				if err := tx.WithContext(ctx).Where("tmdb_id = ?", a.TheMovieDBID).FirstOrCreate(&actor, entities.Actor{
					TheMovieDBID: a.TheMovieDBID,
					Name:         a.Name,
					Gender:       a.Gender,
					ProfilePath:  a.ProfilePath,
				}).Error; err != nil {
					return errorwrap.Wrap(ctx, err)
				}
				actors[i] = actor
			}

			movie.Actors = actors
			movie.Genres = genres

			var existingMovie entities.Movie
			err := tx.Where("tmdb_id = ?", movie.TheMovieDBID).First(&existingMovie).Error

			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := tx.WithContext(ctx).Create(&movie).Error; err != nil {
					return errorwrap.Wrap(ctx, err)
				}
			} else if err == nil {
				movie.ID = existingMovie.ID
				if err := tx.WithContext(ctx).Save(&movie).Error; err != nil {
					return errorwrap.Wrap(ctx, err)
				}
			} else {
				return errorwrap.Wrap(ctx, err)
			}

			if err := tx.WithContext(ctx).Model(&movie).Association("Genres").Replace(genres); err != nil {
				return errorwrap.Wrap(ctx, err)
			}
			if err := tx.WithContext(ctx).Model(&movie).Association("Actors").Replace(actors); err != nil {
				return errorwrap.Wrap(ctx, err)
			}

		}

		return errorwrap.Wrap(ctx, nil)
	})
}

func (gm *gormMovies) AddVote(ctx context.Context, movieID int, newValue float32) error {
	return gm.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var movie entities.Movie
		result := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ?", movieID).
			First(&movie)
		if result.Error != nil {
			return result.Error
		}

		newCount := movie.VoteCount + 1
		currentTotal := movie.VoteAverage * float32(movie.VoteCount)
		newAverage := (currentTotal + newValue) / float32(newCount)

		return errorwrap.Wrap(ctx, tx.Model(&movie).Updates(map[string]interface{}{
			"vote_average": newAverage,
			"vote_count":   newCount,
		}).Error)
	})
}

func (gm *gormMovies) DeleteVote(ctx context.Context, movieID int, oldValue float32) error {
	return gm.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var movie entities.Movie

		result := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ?", movieID).
			First(&movie)
		if result.Error != nil {
			return result.Error
		}

		if movie.VoteCount <= 0 {
			return errors.New("cannot remove vote: no votes exist")
		}

		newCount := movie.VoteCount - 1
		currentTotal := movie.VoteAverage * float32(movie.VoteCount)
		newAverage := float32(0) // Default for zero votes

		if newCount > 0 {
			newTotal := currentTotal - oldValue
			newAverage = newTotal / float32(newCount)
		}

		return errorwrap.Wrap(ctx, tx.Model(&movie).Updates(map[string]interface{}{
			"vote_average": newAverage,
			"vote_count":   newCount,
		}).Error)
	})
}
