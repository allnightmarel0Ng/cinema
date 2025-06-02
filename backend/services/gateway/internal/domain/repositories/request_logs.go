package repositories

import (
	"context"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

type RequestLogs interface {
	Insert(ctx context.Context, request *entities.RequestLog) error
}
