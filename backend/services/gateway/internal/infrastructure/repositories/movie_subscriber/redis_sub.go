package moviesubscriber

import (
	"context"
	"encoding/json"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/redis/go-redis/v9"
)

type redisSubscriber struct {
	client *redis.Client

	cfg Config
}

func NewRedisSubcriber(client *redis.Client, cfg Config) repositories.MovieSubscriber {
	return &redisSubscriber{
		client: client,
		cfg:    cfg,
	}
}

func (rs *redisSubscriber) Subscribe(ctx context.Context) <-chan []entities.Movie {
	ch := make(chan []entities.Movie)

	go func() {
		sub := rs.client.Subscribe(ctx, rs.cfg.SubscribeChannel).Channel()

		for {
			select {
			case <-ctx.Done():
				return
			case msg := <-sub:
				var movies []movie
				if err := json.Unmarshal([]byte(msg.String()), &movies); err != nil {
					ctxlogrus.Extract(ctx).Warn("unable to unmrshal data from redis")
					continue
				}

				domainMovies, err := toDomainMovies(movies)
				if err != nil {
					ctxlogrus.Extract(ctx).Warnf("unable to transfer dto movies to domain movies: %s", err.Error())
					continue
				}

				ch <- domainMovies
			}
		}
	}()

	return ch
}

func toDomainMovies(movies []movie) ([]entities.Movie, error) {
	result := make([]entities.Movie, 0, len(movies))

	for _, movie := range movies {
		releaseDate, err := time.Parse("YYYY-MM-DD", movie.ReleaseDate)
		if err != nil {
			return nil, err
		}

		result = append(result, entities.Movie{
			TheMovieDBID:          movie.ID,
			Title:                 movie.Title,
			Overview:              movie.Overview,
			ReleaseDate:           releaseDate,
			PosterPath:            movie.PosterPath,
			TheMovieDBVoteAverage: float32(movie.VoteAverage),
			TheMovieDBVoteCount:   int(movie.VoteCount),
			Adult:                 movie.Adult,
			Revenue:               int(movie.Revenue),
			Genres:                toDomainGenre(movie.Genres),
			Actors:                toDomainActor(movie.Actors),
		})
	}

	return result, nil
}

func toDomainGenre(genres []genre) []entities.Genre {
	result := make([]entities.Genre, 0, len(genres))

	for _, genre := range genres {
		result = append(result, entities.Genre{
			TheMovieDBID: int(genre.ID),
			Name:         genre.Name,
		})
	}

	return result
}

func toDomainActor(actors []actor) []entities.Actor {
	result := make([]entities.Actor, 0, len(actors))

	for _, actor := range actors {
		result = append(result, entities.Actor{
			TheMovieDBID: int(actor.ID),
			Name:         actor.Name,
			Gender:       actor.Gender,
			ProfilePath:  actor.ProfilePath,
		})
	}

	return result
}
