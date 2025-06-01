package moviesubscriber

type movie struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Overview    string  `json:"overview"`
	ReleaseDate string  `json:"release_date"`
	PosterPath  string  `json:"poster_path"`
	VoteAverage float64 `json:"vote_average"`
	VoteCount   int64   `json:"vote_count"`
	Adult       bool    `json:"adult"`
	Revenue     int64   `json:"revenue"`
	Genres      []genre `json:"genres"`
	Credits     struct {
		Actors []actor `json:"cast"`
	} `json:"credits"`
}

type genre struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type actor struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Gender      int    `json:"gender"`
	ProfilePath string `json:"profile_path"`
}
