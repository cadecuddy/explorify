package api

import (
	"github.com/cadecuddy/explorify/pkg/rabbitmq"
	"github.com/cadecuddy/explorify/pkg/utils"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

type HandlePlaylistRequest struct {
	Playlists []spotify.SimplePlaylist `json:"publicPlaylists"`
}

// Recieves logged in user's public playlists and forwards them to the processing queue
func SendPlaylistsToQueue(c *gin.Context) {
	var request HandlePlaylistRequest
	c.BindJSON(&request)

	// Send playlists to processing queue
	ch, err := rabbitmq.GetMessageQueueChannel()
	utils.PanicOnError(err)

	// publish all playlists to the processing queue
	for _, playlist := range request.Playlists {
		err = ch.Publish(
			"",
			"playlists-to-process",
			false,
			false,
			amqp.Publishing{
				ContentType:  "text/plain",
				Body:         []byte(playlist.ID.String()),
				DeliveryMode: 2,
			},
		)
		utils.PanicOnError(err)
	}

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}
