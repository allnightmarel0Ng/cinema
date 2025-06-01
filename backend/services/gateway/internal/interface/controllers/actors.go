package controllers

import (
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/interface/api"
	"github.com/gin-gonic/gin"
)

type Actors struct {
	actors repositories.Actors
}

func NewActors(actors repositories.Actors) Actors {
	return Actors{
		actors: actors,
	}
}

func (a Actors) GetActorsSearch(c *gin.Context, params api.GetActorsSearchParams) {
	actors, err := a.actors.SearchByName(c.Request.Context(), params.Prompt)
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, actors)
}

func (a Actors) GetActorsId(c *gin.Context, id int) {
	actor, err := a.actors.GetByID(c.Request.Context(), id)
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, actor)
}
