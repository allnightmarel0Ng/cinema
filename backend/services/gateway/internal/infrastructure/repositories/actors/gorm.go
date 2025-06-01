package actors

import (
	"context"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"gorm.io/gorm"
)

type gormActors struct {
	db *gorm.DB

	timeout time.Duration
}

func NewGORMRepository(db *gorm.DB, timeout time.Duration) repositories.Actors {
	return &gormActors{
		db:      db,
		timeout: timeout,
	}
}

func (ga *gormActors) GetByID(ctx context.Context, id int) (entities.Actor, error) {
	ctx, cancel := context.WithTimeout(ctx, ga.timeout)
	defer cancel()

	var actor entities.Actor
	err := ga.db.WithContext(ctx).First(&actor, id).Error
	return actor, err
}

func (ga *gormActors) SearchByName(ctx context.Context, name string) ([]entities.Actor, error) {
	ctx, cancel := context.WithTimeout(ctx, ga.timeout)
	defer cancel()

	var actors []entities.Actor
	err := ga.db.WithContext(ctx).
		Where("name ILIKE ?", "%"+name+"%").
		Find(&actors).Error
	return actors, err
}
