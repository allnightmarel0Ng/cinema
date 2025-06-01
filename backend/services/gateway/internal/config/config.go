package config

import (
	"os"
	"time"

	moviesubscriber "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/movie_subscriber"
	"github.com/joho/godotenv"
)

type Config struct {
	Subscriber moviesubscriber.Config
	Database   DatabaseConfig
	Redis      RedisConfig
	Auth       AuthConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string

	Timeout time.Duration
}

type RedisConfig struct {
	Addr string
}

type AuthConfig struct {
	Host    string
	Timeout time.Duration
}

func MustLoad() Config {
	godotenv.Load()

	return Config{
		Subscriber: moviesubscriber.Config{
			SubscribeChannel: stringOrDefault("REDIS_SUBSCRIBE_CHANNEL", "movies"),
		},

		Database: DatabaseConfig{
			Host:     stringOrDefault("DATABASE_HOST", ""),
			Port:     stringOrDefault("DATABASE_PORT", ""),
			User:     stringOrDefault("DATABASE_USER", ""),
			Password: stringOrDefault("DATABASE_PASSWORD", ""),
			Name:     stringOrDefault("DATABASE_NAME", ""),

			Timeout: timeOrDefault("DATABASE_TIMEOUT", 10*time.Second),
		},

		Redis: RedisConfig{
			Addr: stringOrDefault("REDIS_ADDR", ""),
		},

		Auth: AuthConfig{
			Host:    stringOrDefault("AUTH_HOST", ""),
			Timeout: timeOrDefault("AUTH_TIMEOUT", 5*time.Second),
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
