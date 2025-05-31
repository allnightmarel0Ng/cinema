package entities

type Genre struct {
	ID           int    `gorm:"primaryKey;autoIncrement" json:"id"`
	TheMovieDBID int    `gorm:"index:idx_genre_tmdb_id,unique;column:tmdb_id" json:"tmdb_id"`
	Name         string `gorm:"index:idx_genre_name,unique" json:"name"`
}
