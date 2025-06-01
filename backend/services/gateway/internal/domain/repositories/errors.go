package repositories

import "errors"

var (
	ErrNotFound     = errors.New("entity you asked was not found")
	ErrUnexpected   = errors.New("unexpected error happened")
	ErrInvalidInput = errors.New("invalid input, constraint violated")
)
