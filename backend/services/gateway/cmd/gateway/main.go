package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/application/poll"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/config"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	moviesubscriber "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movie_subscriber"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movies"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})

	cfg := config.MustLoad()

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.Port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	if err = db.AutoMigrate(
		&entities.Actor{},
		&entities.Genre{},
		&entities.Movie{},
		&entities.Review{},
	); err != nil {
		panic(err)
	}

	moviesRepo := movies.NewGORMRepository(db, cfg.Movies)

	redisClient := redis.NewClient(&redis.Options{Addr: cfg.Redis.Addr, Password: "", DB: 0})
	if err := redisClient.Echo(context.Background(), nil).Err(); err != nil {
		panic(err)
	}

	subscriber := moviesubscriber.NewRedisSubcriber(redisClient, cfg.Subscriber)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ctx = ctxlogrus.ToContext(ctx, logger.WithFields(logrus.Fields{"service": "etl"}))

	go poll.New(subscriber, moviesRepo).Poll(ctx)

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	<-shutdown
}
