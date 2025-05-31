package movies

import (
	"time"
)

type Config struct {
	RedisPublisherConfig
}

type RedisPublisherConfig struct {
	Addr           string
	PublishChannel string
	Timeout        time.Duration
}
