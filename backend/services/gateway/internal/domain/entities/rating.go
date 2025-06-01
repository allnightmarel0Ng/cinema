package entities

type Rating struct {
	UserID  int     `gorm:"primaryKey;autoIncrement:false" json:"user_id"`
	MovieID int     `gorm:"primaryKey;autoIncrement:false" json:"movie_id"`
	Rating  float32 `json:"rating"`
}
