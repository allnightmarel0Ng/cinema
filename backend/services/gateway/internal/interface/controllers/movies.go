package controllers

import (
	"fmt"
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"
	"github.com/gin-gonic/gin"
)

type MovieWithStreamLink struct {
	entities.Movie
	StreamLink string `json:"stream_link"`
}

func AddStreamLink(movie entities.Movie) MovieWithStreamLink {
	return MovieWithStreamLink{
		Movie:      movie,
		StreamLink: fmt.Sprintf("https://vidsrc.xyz/embed/movie/%d", movie.TheMovieDBID),
	}
}

type Movies struct {
	movies repositories.Movies
}

func NewMovies(movies repositories.Movies) Movies {
	return Movies{
		movies: movies,
	}
}

func (m Movies) GetMoviesId(c *gin.Context, id int) {
	movie, err := m.movies.GetByID(c.Request.Context(), id)
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, AddStreamLink(movie))
}

func (m Movies) GetMoviesPopular(c *gin.Context, params api.GetMoviesPopularParams) {
	pageNumber := func() int {
		if params.Page == nil {
			return 1
		}

		return *params.Page
	}()

	pageSize := func() int {
		if params.Size == nil {
			return 5
		}

		return *params.Size
	}()

	if pageNumber <= 0 || pageSize <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid pagination",
		})
		return
	}

	found, err := m.movies.GetPopular(c.Request.Context(), (pageNumber-1)*pageSize, pageSize)
	if err != nil {
		sendError(c, err)
		return
	}

	withStreamLinks := make([]MovieWithStreamLink, 0, len(found))
	for _, movie := range found {
		withStreamLinks = append(withStreamLinks, AddStreamLink(movie))
	}

	c.JSON(http.StatusOK, withStreamLinks)
}

func (m Movies) GetMoviesSearch(c *gin.Context, params api.GetMoviesSearchParams) {
	found, err := m.movies.SearchByTitle(c.Request.Context(), params.Prompt)
	if err != nil {
		sendError(c, err)
		return
	}

	withStreamLinks := make([]MovieWithStreamLink, 0, len(found))
	for _, movie := range found {
		withStreamLinks = append(withStreamLinks, AddStreamLink(movie))
	}

	c.JSON(http.StatusOK, withStreamLinks)
}
