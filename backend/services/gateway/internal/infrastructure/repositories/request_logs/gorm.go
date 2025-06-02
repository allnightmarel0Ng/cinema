package requestlogs

import (
	"context"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	errorwrap "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/repositories/error_wrap"
	"gorm.io/gorm"
)

type gormRequestLogs struct {
	db *gorm.DB

	timeout time.Duration
}

func NewGORMRepository(db *gorm.DB, timeout time.Duration) repositories.RequestLogs {
	return &gormRequestLogs{
		db:      db,
		timeout: timeout,
	}
}

func (grl *gormRequestLogs) Insert(ctx context.Context, request *entities.RequestLog) error {
	if request == nil {
		return nil
	}

	return errorwrap.Wrap(ctx, grl.db.WithContext(ctx).Create(request).Error)
}
