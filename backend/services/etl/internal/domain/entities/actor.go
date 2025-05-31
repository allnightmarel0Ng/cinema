package entities

type Actor struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Gender       int    `json:"gender"`
	ProfilePath  string `json:"profile_path"`
}
