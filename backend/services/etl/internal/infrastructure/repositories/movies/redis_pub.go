package movies

import (
	"context"
	"encoding/json"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/repositories"
	"github.com/redis/go-redis/v9"
)

type redisPublisher struct {
	client *redis.Client
	cfg    Config
}

func NewRedisPublisher(client *redis.Client, cfg Config) repositories.Movies {
	return &redisPublisher{client: client, cfg: cfg}
}

func (rp *redisPublisher) InsertMovies(ctx context.Context, movies []entities.Movie) error {
	ctx, cancel := context.WithTimeout(ctx, rp.cfg.Timeout.Abs())
	defer cancel()

	raw, err := json.Marshal(movies)
	if err != nil {
		return err
	}

	return rp.client.Publish(ctx, rp.cfg.PublishChannel, raw).Err()
}
