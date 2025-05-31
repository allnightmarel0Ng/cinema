package config

import (
	"os"
	"strconv"
	"time"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/application/pipeline"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/infrastructure/clients/tmdb"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/infrastructure/repositories/movies"
	"github.com/joho/godotenv"
)

type Config struct {
	Pipeline pipeline.Config
	Movies   movies.Config
	TMDB     tmdb.Config
}

func MustLoad() Config {
	godotenv.Load()
	return Config{
		Pipeline: pipeline.Config{
			BatchSize: intOrDefault("DOWNLOAD_BATCH_SIZE", 10),
			StartID: intOrDefault("DOWNLOAD_START_ID", 1),
			ExtractTickrate: timeOrDefault("DOWNLOAD_TICKRATE", time.Minute),
		},
		Movies: movies.Config{
			RedisPublisherConfig: movies.RedisPublisherConfig{
				Addr: stringOrDefault("REDIS_ADDR", ""),
				Timeout: timeOrDefault("REDIS_TIMEOUT", 5 * time.Second),
				PublishChannel: stringOrDefault("REDIS_PUBLISH_CHANNEL", "movies"),
			},
		},
		TMDB: tmdb.Config{
			Bearer: stringOrDefault("TMDB_BEARER_TOKEN", ""),
			RequestTimeout: timeOrDefault("TMDB_REQUEST_TIMEOUT", 5 * time.Second),
			Host: stringOrDefault("TMDB_HOST", "api.themoviedb.org"),
		},
	}
}

func intOrDefault(envName string, defaultValue int) int {
	raw, ok := os.LookupEnv(envName)
	if !ok {
		return defaultValue
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return defaultValue
	}

	return value
}

func timeOrDefault(envName string, defaultValue time.Duration) time.Duration {
	raw, ok := os.LookupEnv(envName)
	if !ok {
		return defaultValue
	}
	
	value, err := time.ParseDuration(raw)
	if err != nil {
		return defaultValue
	}

	return value
}

func stringOrDefault(envName, defaultValue string) string {
	value, ok := os.LookupEnv(envName)
	if !ok {
		return defaultValue
	}

	return value
}