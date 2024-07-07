package api

import (
	"github.com/cadecuddy/explorify/pkg/rabbitmq"
	"github.com/cadecuddy/explorify/pkg/utils"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

type HandlePlaylistRequest struct {
	AccessToken string                   `json:"accessToken"`
	Playlists   []spotify.SimplePlaylist `json:"playlists"`
}

// Recieves logged in user's public playlists and forwards them to the processing queue
func SendPlaylistsToQueue(c *gin.Context) {
	var request HandlePlaylistRequest
	c.BindJSON(&request)

	// Send playlists to processing queue
	ch, err := rabbitmq.GetMessageQueueChannel()
	utils.FailOnError(err, "Failed to connect to RabbitMQ Channel")

	// publish all playlists to the processing queue
	for _, playlist := range request.Playlists {
		err = ch.Publish(
			"",
			"playlists-to-process",
			false,
			false,
			// publish the playlist ID and the user's access token
			amqp.Publishing{
				ContentType: "application/json",
				Body:        []byte(`{"playlistId": "` + string(playlist.ID) + `", "accessToken": "` + request.AccessToken + `"}`),
			},
		)
		utils.FailOnError(err, "Failed to publish a message")
	}

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}
