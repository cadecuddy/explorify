package utils

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/cadecuddy/explorify-processor/internal/types"
	"github.com/zmb3/spotify"
)

func GetPlaylistFromMessage(message types.PlaylistMessage) (*spotify.FullPlaylist, error) {
	// get full playlist from Spotify api request to fill in the missing follower count
	client := &http.Client{}
	req, err := http.NewRequest("GET", types.PLAYLIST_ENDPOINT+message.PlaylistId, nil)
	if err != nil {
		log.Printf("Error creating request: %s", err)
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+message.AccessToken)
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request: %s", err)
		return nil, err
	}
	defer resp.Body.Close()

	playlist := &spotify.FullPlaylist{}
	err = json.NewDecoder(resp.Body).Decode(playlist)
	if err != nil {
		log.Printf("Error decoding response: %s", err)
		return nil, err
	}

	if !playlist.IsPublic {
		return nil, errors.New("playlist is not public")
	}

	return playlist, nil
}
