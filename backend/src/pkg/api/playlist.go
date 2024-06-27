package api

import (
	"github.com/gin-gonic/gin"
)

type HandlePlaylistRequest struct {
	Playlists []string `json:"publicPlaylists"`
}

func HandlePlaylists(c *gin.Context) {
	var request HandlePlaylistRequest
	c.BindJSON(&request)

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}
