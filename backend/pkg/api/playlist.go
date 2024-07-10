package api

import (
	"encoding/json"

	"github.com/cadecuddy/explorify/pkg/rabbitmq"
	"github.com/cadecuddy/explorify/pkg/utils"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

type HandlePlaylistRequest struct {
	AccessToken string                 `json:"accessToken"`
	Playlists   []spotify.FullPlaylist `json:"playlists"`
}

type PlaylistMessage struct {
	AccessToken string               `json:"access_token"`
	Playlist    spotify.FullPlaylist `json:"playlist"`
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
		message := PlaylistMessage{
			AccessToken: request.AccessToken,
			Playlist:    playlist,
		}

		messageBody, err := json.Marshal(message)
		if err != nil {
			utils.FailOnError(err, "Failed to marshal playlist message")
			continue
		}

		err = ch.Publish(
			"",
			"playlists-to-process",
			false,
			false,
			amqp.Publishing{
				ContentType: "application/json",
				Body:        messageBody,
			},
		)
		utils.FailOnError(err, "Failed to publish a message")
	}

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}
