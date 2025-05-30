package entities

type Genre struct {
	ID           int64  `gorm:"primaryKey;autoIncrement" json:"-"`
	TheMovieDBID int64  `gorm:"uniqueIndex;not null;column:tmdb_id" json:"id"`
	Name         string `gorm:"not null" json:"name"`
}
