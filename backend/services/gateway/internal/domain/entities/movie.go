package entities

import "time"

type Movie struct {
	ID                    int       `gorm:"primaryKey;autoIncrement" json:"id"`
	TheMovieDBID          int64     `gorm:"index:idx_movie_tmdb_id,unique;column:tmdb_id" json:"tmdb_id"`
	Title                 string    `gorm:"index:idx_movie_title" json:"title"`
	Overview              string    `gorm:"type:text" json:"overview"`
	ReleaseDate           time.Time `json:"release_date"`
	PosterPath            string    `json:"poster_path"`
	TheMovieDBVoteAverage float32   `json:"tmdb_vote_average"`
	TheMovieDBVoteCount   int       `json:"tmdb_vote_count"`
	VoteAverage           float32   `json:"vote_average"`
	VoteCount             int       `json:"vote_count"`
	Adult                 bool      `json:"adult"`
	Revenue               int       `json:"revenue"`
	Genres                []Genre   `gorm:"many2many:movie_genres;constraint:OnDelete:CASCADE;" json:"genres"`
	Actors                []Actor   `gorm:"many2many:movie_actors;constraint:OnDelete:CASCADE;" json:"actors"`
}
