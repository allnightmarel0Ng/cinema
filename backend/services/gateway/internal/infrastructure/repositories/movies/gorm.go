package movies

import (
	"context"
	"errors"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"gorm.io/gorm"
)

type gormMovies struct {
	db *gorm.DB

	cfg Config
}

func NewGORMRepository(db *gorm.DB, cfg Config) repositories.Movies {
	return &gormMovies{
		db:  db,
		cfg: cfg,
	}
}

func (gm *gormMovies) InsertMovies(ctx context.Context, movies []entities.Movie) error {
	return gm.db.Transaction(func(tx *gorm.DB) error {
		ctx, cancel := context.WithTimeout(ctx, gm.cfg.Timeout)
		defer cancel()

		for _, movie := range movies {
			genres := make([]entities.Genre, len(movie.Genres))
			for i, g := range movie.Genres {
				var genre entities.Genre
				if err := tx.WithContext(ctx).Where("tmdb_id = ?", g.TheMovieDBID).FirstOrCreate(&genre, entities.Genre{
					TheMovieDBID: g.TheMovieDBID,
					Name:         g.Name,
				}).Error; err != nil {
					return err
				}
				genres[i] = genre
			}

			actors := make([]entities.Actor, len(movie.Actors))
			for i, a := range movie.Actors {
				var actor entities.Actor
				if err := tx.Where("tmdb_id = ?", a.TheMovieDBID).FirstOrCreate(&actor, entities.Actor{
					TheMovieDBID: a.TheMovieDBID,
					Name:         a.Name,
					Gender:       a.Gender,
					ProfilePath:  a.ProfilePath,
				}).Error; err != nil {
					return err
				}
				actors[i] = actor
			}

			var existingMovie entities.Movie
			err := tx.Where("tmdb_id = ?", movie.TheMovieDBID).First(&existingMovie).Error

			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := tx.Create(movie).Error; err != nil {
					return err
				}
			} else if err == nil {
				movie.ID = existingMovie.ID
				if err := tx.Save(movie).Error; err != nil {
					return err
				}
			} else {
				return err
			}

			if err := tx.Model(movie).Association("Genres").Replace(genres); err != nil {
				return err
			}
			if err := tx.Model(movie).Association("Actors").Replace(actors); err != nil {
				return err
			}

		}

		return nil
	})
}
