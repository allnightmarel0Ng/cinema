package controllers

import (
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/middleware"
	"github.com/gin-gonic/gin"
)

type Ratings struct {
	ratings repositories.Ratings
	movies  repositories.Movies
}

func NewRatings(ratings repositories.Ratings, movies repositories.Movies) Ratings {
	return Ratings{
		ratings: ratings,
		movies:  movies,
	}
}

func (r Ratings) PostRating(c *gin.Context, params api.PostRatingParams) {
	user, err := middleware.UserFromContext(c.Request.Context())
	if err != nil {
		sendError(c, err)
		return
	}

	if params.Rating < 0 || params.Rating > 10 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "rating must be between 0 and 10",
		})
		return
	}

	if err = r.ratings.CreateRating(c.Request.Context(), entities.Rating{
		UserID:  user.ID,
		MovieID: params.MovieId,
		Rating:  params.Rating,
	}); err != nil {
		sendError(c, err)
		return
	}

	if err = r.movies.AddVote(c.Request.Context(), params.MovieId, params.Rating); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (r Ratings) DeleteRating(c *gin.Context, params api.DeleteRatingParams) {
	user, err := middleware.UserFromContext(c.Request.Context())
	if err != nil {
		sendError(c, err)
		return
	}

	value, err := r.ratings.DeleteRating(c.Request.Context(), user.ID, params.MovieId)
	if err != nil {
		sendError(c, err)
		return
	}

	if err = r.movies.DeleteVote(c.Request.Context(), params.MovieId, value); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
