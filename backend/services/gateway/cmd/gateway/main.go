package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/application/poll"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/config"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/clients/auth"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/metrics"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/actors"
	moviesubscriber "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movie_subscriber"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movies"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/ratings"
	requestlogs "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/request_logs"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/reviews"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/tracing"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/controllers"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"gorm.io/driver/clickhouse"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormtracing "gorm.io/plugin/opentelemetry/tracing"
)

func main() {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg := config.MustLoad()

	traceFunc := tracing.MustInit(ctx, cfg.Collector.Addr)
	defer traceFunc()

	metricFunc := metrics.MustInit(ctx, cfg.Collector.Addr)
	defer metricFunc()

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.Port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
	if err != nil {
		panic(err)
	}

	if err = db.AutoMigrate(
		&entities.Actor{},
		&entities.Genre{},
		&entities.Movie{},
		&entities.Review{},
		&entities.Rating{},
	); err != nil {
		panic(err)
	}

	if err = db.Use(gormtracing.NewPlugin()); err != nil {
		panic(err)
	}

	clickhouse, err := gorm.Open(clickhouse.Open(fmt.Sprintf("clickhouse://%s:%s@%s:%s/%s",
		cfg.Clickhouse.User, cfg.Clickhouse.Password, cfg.Clickhouse.Host, cfg.Clickhouse.Port, cfg.Clickhouse.Name)))
	if err != nil {
		panic(err)
	}

	if err = clickhouse.AutoMigrate(&entities.RequestLog{}); err != nil {
		panic(err)
	}

	if err = clickhouse.Use(gormtracing.NewPlugin()); err != nil {
		panic(err)
	}

	if err = clickhouse.Exec(`
        ALTER TABLE request_logs 
        MODIFY TTL timestamp + INTERVAL 30 DAY
    `).Error; err != nil {
		panic(err)
	}

	requestLogs := requestlogs.NewGORMRepository(clickhouse, cfg.Clickhouse.Timeout)

	authClient := auth.NewHTTPClient(cfg.Auth.Host, cfg.Auth.Timeout)

	moviesRepo := movies.NewGORMRepository(db, cfg.Database.Timeout)
	actorsRepo := actors.NewGORMRepository(db, cfg.Database.Timeout)
	ratingsRepo := ratings.NewGORMRepository(db, cfg.Database.Timeout)
	reviewsRepo := reviews.NewGORMRepository(db, cfg.Database.Timeout)

	moviesController := controllers.NewMovies(moviesRepo)
	actorsController := controllers.NewActors(actorsRepo)
	authController := controllers.NewAuth(authClient)
	ratingsController := controllers.NewRatings(ratingsRepo, moviesRepo)
	reviewsController := controllers.NewReviews(reviewsRepo)
	usersController := controllers.NewUsers(reviewsRepo, ratingsRepo, authClient)

	mainController := controllers.Main{
		Actors:  actorsController,
		Auth:    authController,
		Movies:  moviesController,
		Ratings: ratingsController,
		Reviews: reviewsController,
		Users:   usersController,
	}

	gin.SetMode("release")
	router := gin.New()

	router.Use(cors.New(cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowAllOrigins:  true,
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(otelgin.Middleware("gateway"))

	api.RegisterHandlersWithOptions(router, mainController, api.GinServerOptions{
		BaseURL: "/api",
		Middlewares: []api.MiddlewareFunc{
			api.MiddlewareFunc(middleware.NewMetric()),
			api.MiddlewareFunc(middleware.NewSendRequestLog(requestLogs)),
			api.MiddlewareFunc(middleware.NewLogger(logger.WithFields(logrus.Fields{"service": "gateway"}))),
			api.MiddlewareFunc(middleware.NewAuth(authClient)),
		},
	})

	redisClient := redis.NewClient(&redis.Options{Addr: cfg.Redis.Addr, Password: "", DB: 0})
	if err := redisClient.Echo(context.Background(), nil).Err(); err != nil {
		panic(err)
	}

	subscriber := moviesubscriber.NewRedisSubcriber(redisClient, cfg.Subscriber)

	ctx = ctxlogrus.ToContext(ctx, logger.WithFields(logrus.Fields{"service": "gateway"}))

	go poll.New(subscriber, moviesRepo).Poll(ctx)

	go router.Run(":8080")

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	<-shutdown
}
