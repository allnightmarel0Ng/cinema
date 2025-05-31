package tmdb

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/clients"
	"github.com/allnightmarel0Ng/cinema/backend/services/etl/internal/domain/entities"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

type httpClient struct {
	client *http.Client

	cfg Config
}

func NewHTTPClient(cfg Config) clients.TMDB {
	return &httpClient{
		client: http.DefaultClient,
		cfg:    cfg,
	}
}

func (h *httpClient) FetchMovies(ctx context.Context, startID int64, size int, tickrate time.Duration) <-chan []entities.Movie {
	moviesChan := make(chan []entities.Movie)

	go func() {
		defer close(moviesChan)

		ticker := time.NewTicker(tickrate)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return

			case <-ticker.C:
				movies := make([]entities.Movie, 0, size)
				for i := startID; i < startID+int64(size); i++ {
					url := fmt.Sprintf("https://%s/3/movie/%d?append_to_response=credits&language=en-US", h.cfg.Host, i)

					reqCtx, cancel := context.WithTimeout(ctx, h.cfg.RequestTimeout)
					defer cancel()

					req, err := http.NewRequestWithContext(reqCtx, "GET", url, nil)
					if err != nil {
						ctxlogrus.Extract(ctx).Warnf("error creating request: %v\n", err)
						continue
					}

					req.Header.Add("accept", "application/json")
					req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", h.cfg.Bearer))

					res, err := h.client.Do(req)
					if err != nil {
						ctxlogrus.Extract(ctx).Warnf("error making request: %v\n", err)
						continue
					}
					defer res.Body.Close()

					if res.StatusCode != http.StatusOK {
						ctxlogrus.Extract(ctx).Warnf("Received non-200 response: %d\n", res.StatusCode)
						body, _ := io.ReadAll(res.Body)
						ctxlogrus.Extract(ctx).Warnf("Response body: %s\n", body)
						continue
					}

					body, _ := io.ReadAll(res.Body)

					var movie entities.Movie
					if err := json.Unmarshal(body, &movie); err != nil {
						ctxlogrus.Extract(ctx).Warnf("Error unmarshalling response: %v\n", err)
						continue
					}

					movies = append(movies, movie)
				}

				moviesChan <- movies
				startID += int64(size)
			}
		}
	}()

	return moviesChan
}
