package utils

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/cadecuddy/explorify-processor/pkg/types"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

func FetchTracks(d amqp.Delivery) ([]spotify.PlaylistTrack, error) {
	var message types.PlaylistMessage
	err := json.Unmarshal(d.Body, &message)
	if err != nil {
		log.Printf("Error unmarshalling message: %s", err)
		d.Nack(false, true)
		return nil, err
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", types.PLAYLIST_ENDPOINT+message.Playlist.ID.String()+"/tracks?"+types.TRACK_METADATA_QUERY+"&offset=0&limit=100", nil)
	if err != nil {
		log.Printf("Error creating request: %s", err)
		d.Nack(false, true)
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+message.AccessToken)

	var tracks []spotify.PlaylistTrack
	offset := 0

	// get all playlist tracks
	for {
		// calling track endpoint
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error making request: %s", err)
			d.Nack(false, true)
			return nil, err
		}
		defer resp.Body.Close()

		// checking status code
		if resp.StatusCode != http.StatusOK {
			log.Printf("Non-200 response: %d", resp.StatusCode)
			d.Nack(false, true)
			return nil, err
		}

		// unmarshall response
		var playlistTracks spotify.PlaylistTrackPage
		err = json.NewDecoder(resp.Body).Decode(&playlistTracks)
		if err != nil {
			log.Printf("Error decoding response: %s", err)
			d.Nack(false, true)
			return nil, err
		}

		// if track count is greater than 1000, drop the message
		// if playlistTracks.Total > 1000 {
		// 	return nil, fmt.Errorf("playlist has more than 1000 tracks: %d", playlistTracks.Total)
		// }

		tracks = append(tracks, playlistTracks.Tracks...)
		if playlistTracks.Next == "" {
			break
		}
		offset += 100
		req.URL.RawQuery = "offset=" + strconv.Itoa(offset) + "&limit=100"
	}

	return tracks, nil
}
