package main

import (
	"context"
	"os/signal"
	"syscall"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/application/pipeline"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/config"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/infrastructure/clients/tmdb"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/infrastructure/repositories/movies"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

func main() {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})

	cfg := config.MustLoad()
	logger.Info("config loaded")

	tmdbClient := tmdb.NewHTTPClient(cfg.TMDB)
	redisClient := redis.NewClient(&redis.Options{Addr: cfg.Movies.Addr, Password: "", DB: 0})
	if err := redisClient.Echo(context.Background(), nil).Err(); err != nil {
		logger.Fatal(err)
	}

	logger.Info("redis connection established")

	moviesRepo := movies.NewRedisPublisher(redisClient, cfg.Movies)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ctx = ctxlogrus.ToContext(ctx, logger.WithFields(logrus.Fields{"service": "etl"}))

	pipeline := pipeline.New(cfg.Pipeline, moviesRepo, tmdbClient)

	logger.Info("starting to download")

	pipeline.Start(ctx)

	signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)

	logger.Info("graceful shutdown")
}
