package pipeline

import (
	"context"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/clients"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/repositories"
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
	startID, err := p.movies.GetMaxID(ctx)
	if err != nil {
		return err
	}

	for movies := range p.tmdb.FetchMovies(ctx, startID, p.cfg.BatchSize, p.cfg.ExtractTickrate) {
		for _, movie := range movies {
			if err := p.movies.InsertMovie(ctx, &movie); err != nil {
				return err
			}
		}
	}

	return nil
}
