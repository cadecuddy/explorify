package database

import (
	"fmt"
	"strings"
)

type Playlist struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	URL         string `json:"url"`
	Followers   int    `json:"followers"`
	Image       string `json:"image"`
	Name        string `json:"name"`
	OwnerURL    string `json:"ownerUrl"`
	OwnerName   string `json:"ownerName"`
	TotalTracks int    `json:"tracks"`
}

// Queries for all playlists in the database that have the provided track ids in common
func GetPlaylistsFromTracks(trackIds []string) ([]Playlist, error) {
	db, err := GetConnection()
	if err != nil {
		return nil, err
	}

	placeholders := strings.Repeat("?,", len(trackIds))
	placeholders = placeholders[:len(placeholders)-1]

	InOrEquals := func() string {
		if len(trackIds) > 1 {
			return "IN"
		}
		return "="
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.description, p.url, p.followers, p.image, p.name, p.owner_url, p.owner_displayName, p.tracks_total
        FROM Playlist p
        JOIN TrackToPlaylist ttp ON p.id = ttp.playlist_id
        WHERE ttp.track_id %s (%s)
        GROUP BY p.id
        HAVING COUNT(DISTINCT ttp.track_id) = ?
	`, InOrEquals(), placeholders)

	args := make([]interface{}, len(trackIds)+1)
	for i, id := range trackIds {
		args[i] = id
	}
	args[len(trackIds)] = len(trackIds)

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Parse rows into playlists
	playlists := []Playlist{}
	for rows.Next() {
		playlist := Playlist{}
		err := rows.Scan(&playlist.ID,
			&playlist.Description,
			&playlist.URL,
			&playlist.Followers,
			&playlist.Image,
			&playlist.Name,
			&playlist.OwnerURL,
			&playlist.OwnerName,
			&playlist.TotalTracks,
		)

		if err != nil {
			return nil, err
		}

		playlists = append(playlists, playlist)
	}

	return playlists, nil
}
