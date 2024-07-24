package utils

import (
	"encoding/json"
	"log"

	"github.com/cadecuddy/explorify-processor/pkg/types"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

func GetAccessTokenFromMessage(d amqp.Delivery) (string, error) {
	var message types.PlaylistMessage
	err := json.Unmarshal(d.Body, &message)
	if err != nil {
		log.Printf("Error getting access token from message: %s", err)
		d.Nack(false, true)
		return "", err
	}

	return message.AccessToken, nil
}

func GetPlaylistFromMessage(d amqp.Delivery) (*spotify.FullPlaylist, error) {
	var message types.PlaylistMessage
	err := json.Unmarshal(d.Body, &message)
	if err != nil {
		log.Printf("Error unmarshalling message: %s", err)
		d.Nack(false, true)
		return nil, err
	}

	return &message.Playlist, nil
}
