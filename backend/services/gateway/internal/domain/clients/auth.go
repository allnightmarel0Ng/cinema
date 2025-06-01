package clients

import (
	"context"
	"errors"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
)

var (
	ErrNotFound     = errors.New("user was not found")
	ErrUnexpected   = errors.New("unexpected error")
	ErrBadRequest   = errors.New("bad request")
	ErrUnauthorized = errors.New("unauthorized")
)

type Auth interface {
	Login(ctx context.Context, base64 string) (int, string, error)
	Register(ctx context.Context, body []byte) error
	Logout(ctx context.Context, token string) error
	Authorize(ctx context.Context, token string) (entities.User, error)
	Username(ctx context.Context, userID int) (string, error)
}
