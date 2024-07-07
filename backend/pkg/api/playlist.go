package api

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify"
)

type HandlePlaylistRequest struct {
	Playlists []spotify.SimplePlaylist `json:"publicPlaylists"`
}

func HandlePlaylists(c *gin.Context) {
	var request HandlePlaylistRequest
	c.BindJSON(&request)

	for _, playlist := range request.Playlists {
		fmt.Println(playlist.Name)
	}

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}
