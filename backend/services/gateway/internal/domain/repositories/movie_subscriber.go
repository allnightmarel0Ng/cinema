package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type MovieSubscriber interface {
	Subscribe(ctx context.Context) <-chan []entities.Movie
}
