package controllers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/middleware"
	"github.com/gin-gonic/gin"
)

type Reviews struct {
	reviews repositories.Reviews
}

func NewReviews(reviews repositories.Reviews) Reviews {
	return Reviews{
		reviews: reviews,
	}
}

func (r Reviews) DeleteReviewsMovieId(c *gin.Context, movieId int) {
	user, err := middleware.UserFromContext(c.Request.Context())
	if err != nil {
		sendError(c, err)
		return
	}

	if err = r.reviews.DeleteReview(c.Request.Context(), user.ID, movieId); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (r Reviews) GetReviewsMovieId(c *gin.Context, movieId int) {
	reviews, err := r.reviews.GetByMovieID(c.Request.Context(), movieId)
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func (r Reviews) PostReviewsMovieId(c *gin.Context, movieId int) {
	user, err := middleware.UserFromContext(c.Request.Context())
	if err != nil {
		sendError(c, err)
		return
	}

	raw, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "unable to get body",
		})
		return
	}

	body := &api.PostReviewsMovieIdJSONRequestBody{}

	if err := json.Unmarshal(raw, body); err != nil || body.Liked == nil || body.Text == nil || body.Title == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid body in request",
		})
		return
	}

	if err = r.reviews.CreateOrUpdateReview(c.Request.Context(), entities.Review{
		UserID:  user.ID,
		MovieID: movieId,
		Liked:   *body.Liked,
		Title:   *body.Title,
		Text:    *body.Text,
	}); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
