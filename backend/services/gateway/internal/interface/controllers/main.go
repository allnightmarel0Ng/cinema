package controllers

import "github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"

type Main struct {
	Actors
	Auth
	Movies
	Ratings
	Reviews
	Users
}

var _ api.ServerInterface = (*Main)(nil)
