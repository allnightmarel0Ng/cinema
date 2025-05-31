package entities

type Movie struct {
	ID           int64   `json:"id"`
	Title        string  `json:"title"`
	Overview     string  `json:"overview"`
	ReleaseDate  string  `json:"release_date"`
	PosterPath   string  `json:"poster_path"`
	VoteAverage  float64 `json:"vote_average"`
	VoteCount    int64   `json:"vote_count"`
	Adult        bool    `json:"adult"`
	Revenue      int64   `json:"revenue"`
	Genres       []Genre `json:"genres"`
	Actors       []Actor `json:"cast"`
}
