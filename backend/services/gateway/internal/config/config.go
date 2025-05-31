package config

import (
	"os"
	"time"

	moviesubscriber "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movie_subscriber"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movies"
	"github.com/joho/godotenv"
)

type Config struct {
	Subscriber moviesubscriber.Config
	Movies     movies.Config
	Database   DatabaseConfig
	Redis      RedisConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

type RedisConfig struct {
	Addr string
}

func MustLoad() Config {
	godotenv.Load()

	return Config{
		Subscriber: moviesubscriber.Config{
			SubscribeChannel: stringOrDefault("REDIS_SUBSCRIBE_CHANNEL", "movies"),
		},

		Movies: movies.Config{
			Timeout: timeOrDefault("MOVIE_DB_TIMEOUT", 5*time.Second),
		},

		Database: DatabaseConfig{
			Host:     stringOrDefault("DATABASE_HOST", ""),
			Port:     stringOrDefault("DATABASE_PORT", ""),
			User:     stringOrDefault("DATABASE_USER", ""),
			Password: stringOrDefault("DATABASE_PASSWORD", ""),
			Name:     stringOrDefault("DATABASE_NAME", ""),
		},

		Redis: RedisConfig{
			Addr: stringOrDefault("REDIS_ADDR", ""),
		},
	}
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
