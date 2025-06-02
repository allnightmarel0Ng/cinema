package entities

type Actor struct {
	ID           int    `gorm:"primaryKey;autoIncrement" json:"id"`
	TheMovieDBID int    `gorm:"index:idx_actor_tmdb_id,unique;column:tmdb_id" json:"tmdb_id"`
	Name         string `json:"name"`
	Gender       int    `json:"gender"`
	ProfilePath  string `json:"profile_path"`
}
