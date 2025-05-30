package entities

type Movie struct {
	ID           int64   `gorm:"primaryKey;autoIncrement" json:"-"`
	TheMovieDBID int64   `gorm:"uniqueIndex;not null;column:tmdb_id" json:"id"`
	Title        string  `gorm:"not null" json:"title"`
	Overview     string  `json:"overview"`
	ReleaseDate  string  `json:"release_date"`
	PosterPath   string  `json:"poster_path"`
	VoteAverage  float64 `json:"vote_average"`
	VoteCount    int64   `json:"vote_count"`
	Adult        bool    `json:"adult"`
	Revenue      int64   `json:"revenue"`
	Genres       []Genre `gorm:"many2many:movie_genres;" json:"genres"`
	Actors       []Actor `gorm:"many2many:movie_actors;" json:"cast"`
}
