package movies

import (
	"context"
	"errors"
	"fmt"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/repositories"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type postgresMovies struct {
	db  *gorm.DB
	cfg Config
}

func NewPostgresMovies(cfg Config) (repositories.Movies, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DatabaseHost, cfg.DatabasePort, cfg.DatabaseUser, cfg.DatabasePass, cfg.DatabaseName)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	models := []any{
		&entities.Actor{},
		&entities.Genre{},
		&entities.Movie{},
	}

	if err = db.AutoMigrate(models...); err != nil {
		return nil, err
	}

	return &postgresMovies{
		db:  db,
		cfg: cfg,
	}, nil
}

func (pm *postgresMovies) GetMaxID(ctx context.Context) (int64, error) {
	var maxID int64
	if err := pm.db.WithContext(ctx).Model(&entities.Movie{}).Select("MAX(id)").Scan(&maxID).Error; err != nil {
		return 0, err
	}
	return maxID, nil
}

func (pm *postgresMovies) InsertMovie(ctx context.Context, movie *entities.Movie) error {
	return pm.db.Transaction(func(tx *gorm.DB) error {
		ctx, cancel := context.WithTimeout(ctx, pm.cfg.Timeout)
		defer cancel()

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

		return nil
	})
}
