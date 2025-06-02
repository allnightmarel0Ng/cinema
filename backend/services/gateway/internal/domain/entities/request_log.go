package entities

import "time"

type RequestLog struct {
	TraceID        string    `gorm:"primaryKey;autoIncrement:false"`
	Timestamp      time.Time `gorm:"index"`
	Method         string
	Path           string
	NormalizedPath string `gorm:"index"`
	StatusCode     int
	StatusClass    string `gorm:"index"`
	DurationMs     int
	UserID         int `gorm:"index"`
}
