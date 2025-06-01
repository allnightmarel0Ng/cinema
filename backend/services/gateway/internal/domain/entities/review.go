package entities

type Review struct {
	UserID  int    `gorm:"primaryKey;autoIncrement:false" json:"user_id"`
	MovieID int    `gorm:"primaryKey;autoIncrement:false" json:"movie_id"`
	Liked   bool   `json:"liked"`
	Title   string `gorm:"size:255" json:"title"`
	Text    string `gorm:"type:text" json:"text"`
}
