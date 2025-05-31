package pipeline

import "time"

type Config struct {
	// The number of movies to process in each batch.
	BatchSize int

	// Starting id of fetch
	StartID int

	// The duration to wait before fetching the next batch of movies.
	ExtractTickrate time.Duration
}
