package utils

import (
	"encoding/json"
	"log"
	"net/http"

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

	// get full playlist from Spotify api request, not a spotify client
	client := &http.Client{}
	req, err := http.NewRequest("GET", types.PLAYLIST_ENDPOINT+message.Playlist.ID.String(), nil)
	if err != nil {
		log.Printf("Error creating request: %s", err)
		d.Nack(false, true)
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+message.AccessToken)
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request: %s", err)
		d.Nack(false, true)
		return nil, err
	}
	defer resp.Body.Close()

	playlist := &spotify.FullPlaylist{}
	err = json.NewDecoder(resp.Body).Decode(playlist)
	if err != nil {
		log.Printf("Error decoding response: %s", err)
		d.Nack(false, true)
		return nil, err
	}

	return playlist, nil
}
