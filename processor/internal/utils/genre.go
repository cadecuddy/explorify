package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/zmb3/spotify"
)

type FullArtistResponse struct {
	Artists []*spotify.FullArtist `json:"artists"`
}

const NumberOfGenresUsed = 5

// analyze all tracks in a playlist by the artists' genres and
// take the top n most common genres as the playlist's classification.
func GetPlaylistGenre(tracks []spotify.PlaylistTrack, accessToken string) ([]string, error) {
	// extract artist IDs from tracks, avoiding duplicates.
	artistIdMap := make(map[spotify.ID]bool)
	for _, track := range tracks {
		for _, artist := range track.Track.Artists {
			artistIdMap[artist.ID] = true
		}
	}

	artistIds := make([]spotify.ID, 0, len(artistIdMap))
	for id := range artistIdMap {
		artistIds = append(artistIds, id)
	}

	// fetch artist genres BATCH
	const maxBatchSize = 50
	var artists []*spotify.FullArtist
	for i := 0; i < len(artistIds); i += maxBatchSize {
		end := i + maxBatchSize
		if end > len(artistIds) {
			end = len(artistIds)
		}
		batchIds := artistIds[i:end]

		spotifyBaseURL := "https://api.spotify.com/v1/"
		idStrings := make([]string, len(batchIds))
		for i, id := range batchIds {
			idStrings[i] = string(id)
		}
		url := fmt.Sprintf("%sartists?ids=%s", spotifyBaseURL, strings.Join(idStrings, ","))

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Authorization", "Bearer "+accessToken)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("failed to fetch artists: status code %d", resp.StatusCode)
		}

		var response FullArtistResponse
		err = json.NewDecoder(resp.Body).Decode(&response)
		if err != nil {
			return nil, err
		}

		artists = append(artists, response.Artists...)
	}

	// freq map
	genreFreq := make(map[string]int)
	for _, artist := range artists {
		if artist == nil {
			continue
		}
		for _, genre := range artist.Genres {
			genreFreq[genre]++
		}
	}

	// get the top n genres
	type genreCount struct {
		genre string
		count int
	}
	var genreCounts []genreCount
	for genre, count := range genreFreq {
		genreCounts = append(genreCounts, genreCount{genre, count})
	}

	sort.Slice(genreCounts, func(i, j int) bool {
		return genreCounts[i].count > genreCounts[j].count
	})

	topGenres := make([]string, 0, NumberOfGenresUsed)
	for i := 0; i < NumberOfGenresUsed && i < len(genreCounts); i++ {
		topGenres = append(topGenres, genreCounts[i].genre)
	}

	return topGenres, nil
}
