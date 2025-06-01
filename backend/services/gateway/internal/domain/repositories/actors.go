package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type Actors interface {
	GetByID(ctx context.Context, id int) (entities.Actor, error)
	SearchByName(ctx context.Context, name string) ([]entities.Actor, error)
}
