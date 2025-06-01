package controllers

import (
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/clients"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/gin-gonic/gin"
)

type Users struct {
	reviews repositories.Reviews
	ratings repositories.Ratings

	auth clients.Auth
}

func NewUsers(reviews repositories.Reviews, ratings repositories.Ratings, auth clients.Auth) Users {
	return Users{
		reviews: reviews,
		ratings: ratings,

		auth: auth,
	}
}

func (u Users) GetUsersId(c *gin.Context, id int) {
	reviews, err := u.reviews.GetByUserID(c.Request.Context(), id)
	if err != nil {
		sendError(c, err)
		return
	}

	ratings, err := u.ratings.GetUserRatings(c.Request.Context(), id)
	if err != nil {
		sendError(c, err)
		return
	}

	username, err := u.auth.Username(c.Request.Context(), id)
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username": username,
		"ratings":  ratings,
		"reviews":  reviews,
	})
}
