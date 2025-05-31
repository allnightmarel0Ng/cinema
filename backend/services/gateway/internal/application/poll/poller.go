package poll

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

type Poller struct {
	subcriber repositories.MovieSubscriber
	movies    repositories.Movies
}

func New(subscriber repositories.MovieSubscriber, movies repositories.Movies) *Poller {
	return &Poller{
		subcriber: subscriber,
		movies:    movies,
	}
}

func (p *Poller) Poll(ctx context.Context) {
	moviesCh := p.subcriber.Subscribe(ctx)
	for {
		select {
		case <-ctx.Done():
			return
		case batch := <-moviesCh:
			if err := p.movies.InsertMovies(ctx, batch); err != nil {
				ctxlogrus.Extract(ctx).Warnf("unable to save extracted movies: %s", err.Error())
				continue
			}

			ctxlogrus.Extract(ctx).Infof("got %d movies", len(batch))
		}
	}
}
