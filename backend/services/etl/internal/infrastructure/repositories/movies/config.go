package movies

import "time"

type Config struct {
	DatabaseHost string
	DatabasePort string
	DatabaseUser string
	DatabasePass string
	DatabaseName string

	Timeout time.Duration
}
