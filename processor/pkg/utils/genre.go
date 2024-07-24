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

func GetPlaylistGenre(tracks []spotify.PlaylistTrack, accessToken string) ([]string, error) {
	artistIds := getArtistIds(tracks)

	artists, err := fetchArtistsGenres(artistIds, accessToken)
	if err != nil {
		return nil, err
	}

	genreFreq := buildGenreFrequencyMap(artists)

	topGenres := getTopGenres(genreFreq, 3)

	return topGenres, nil
}

// get all artist id strings from tracklist, map used to dedupe
func getArtistIds(tracks []spotify.PlaylistTrack) []spotify.ID {
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

	return artistIds
}

func fetchArtistsGenres(artistIDs []spotify.ID, accessToken string) ([]*spotify.FullArtist, error) {
	const maxBatchSize = 50
	var artists []*spotify.FullArtist
	for i := 0; i < len(artistIDs); i += maxBatchSize {
		end := i + maxBatchSize
		if end > len(artistIDs) {
			end = len(artistIDs)
		}

		batch, err := getArtistsBatch(artistIDs[i:end], accessToken)
		if err != nil {
			return nil, err
		}

		artists = append(artists, batch...)
	}
	return artists, nil
}

// Get a batch of artist information from the Spotify API
func getArtistsBatch(artistIDs []spotify.ID, accessToken string) ([]*spotify.FullArtist, error) {
	spotifyBaseURL := "https://api.spotify.com/v1/"
	url := fmt.Sprintf("%sartists?ids=%s", spotifyBaseURL, strings.Join(spotifyIDsToStrings(artistIDs), ","))

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

	return response.Artists, nil
}

// Convert a slice of spotify.ID to a slice of strings
func spotifyIDsToStrings(ids []spotify.ID) []string {
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = string(id)
	}
	return strIDs
}

// Build a frequency map of genres from the list of artists
func buildGenreFrequencyMap(artists []*spotify.FullArtist) map[string]int {
	genreFreq := make(map[string]int)
	for _, artist := range artists {
		if artist == nil {
			continue
		}
		for _, genre := range artist.Genres {
			genreFreq[genre]++
		}
	}
	return genreFreq
}

// Get the top N genres from the frequency map
func getTopGenres(genreFreq map[string]int, topN int) []string {
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

	topGenres := make([]string, 0, topN)
	for i := 0; i < topN && i < len(genreCounts); i++ {
		topGenres = append(topGenres, genreCounts[i].genre)
	}

	return topGenres
}
