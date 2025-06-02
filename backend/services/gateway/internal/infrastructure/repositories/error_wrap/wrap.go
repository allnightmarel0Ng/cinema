package errorwrap

import (
	"context"
	"errors"
	"fmt"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/metrics"
	"gorm.io/gorm"
)

func Wrap(ctx context.Context, err error) error {
	var result error
	defer func() {
		metrics.RecordDBResult(ctx, result)
	}()

	if err == nil {
		result = nil
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		result = repositories.ErrNotFound
	} else if errors.Is(err, gorm.ErrCheckConstraintViolated) {
		result = repositories.ErrInvalidInput
	} else {
		result = fmt.Errorf("%w: %s", repositories.ErrUnexpected, err.Error())
	}

	return result
}
