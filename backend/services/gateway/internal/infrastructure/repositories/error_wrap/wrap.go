package errorwrap

import (
	"errors"
	"fmt"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"gorm.io/gorm"
)

func Wrap(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return repositories.ErrNotFound
	}

	if errors.Is(err, gorm.ErrCheckConstraintViolated) {
		return repositories.ErrInvalidInput
	}

	return fmt.Errorf("%w: %s", repositories.ErrUnexpected, err.Error())
}
