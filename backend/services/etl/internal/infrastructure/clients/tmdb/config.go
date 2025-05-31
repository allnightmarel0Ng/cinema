package tmdb

import "time"

type Config struct {
	Bearer         string
	RequestTimeout time.Duration
	Host           string
}
