package pipeline

import (
	"context"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/clients"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/repositories"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

type Pipeline struct {
	cfg Config

	movies repositories.Movies
	tmdb   clients.TMDB
}

func New(config Config, movies repositories.Movies, tmdb clients.TMDB) *Pipeline {
	return &Pipeline{
		cfg:    config,
		movies: movies,
		tmdb:   tmdb,
	}
}

func (p *Pipeline) Start(ctx context.Context) error {
	moviesCh := p.tmdb.FetchMovies(ctx, int64(p.cfg.StartID), p.cfg.BatchSize, p.cfg.ExtractTickrate)
	for {
		select {
		case <-ctx.Done():
			return nil
		case batch := <-moviesCh:
			ctxlogrus.Extract(ctx).Info("batch of movies fetched successfully")
			if err := p.movies.InsertMovies(ctx, batch); err != nil {
				ctxlogrus.Extract(ctx).Errorf("unable to insert movies to repo: %s", err.Error())
			}
		}
	}
}
