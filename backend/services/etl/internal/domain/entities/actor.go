package entities

type Actor struct {
	ID           int64  `gorm:"primaryKey;autoIncrement" json:"-"`
	TheMovieDBID int64  `gorm:"uniqueIndex;not null;column:tmdb_id" json:"id"`
	Name         string `gorm:"not null" json:"name"`
	Gender       int    `json:"gender"`
	ProfilePath  string `json:"profile_path"`
}
