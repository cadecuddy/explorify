package database

import (
	"database/sql"

	"github.com/zmb3/spotify"
)

// Inserts a playlist into the database. If the playlist is already there
// all fields except for the ID are updated.
func InsertPlaylist(db *sql.DB, playlist spotify.FullPlaylist) error {
	query := `
		INSERT INTO Playlist (id, description, url, followers, image, name, owner_url, owner_displayName, snapshot_id, tracks_total)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE description = VALUES(description), url = VALUES(url), followers = VALUES(followers), image = VALUES(image), name = VALUES(name), owner_url = VALUES(owner_url), owner_displayName = VALUES(owner_displayName), snapshot_id = VALUES(snapshot_id), tracks_total = VALUES(tracks_total)`

	ownerURL := ""
	ownerDisplayName := ""
	if playlist.Owner.ExternalURLs["spotify"] != "" {
		ownerURL = playlist.Owner.ExternalURLs["spotify"]
	}
	if playlist.Owner.DisplayName != "" {
		ownerDisplayName = playlist.Owner.DisplayName
	}

	_, err := db.Exec(query,
		playlist.ID.String(),
		playlist.Description,
		playlist.ExternalURLs["spotify"],
		playlist.Followers.Count,
		playlist.Images[0].URL,
		playlist.Name,
		ownerURL,
		ownerDisplayName,
		playlist.SnapshotID,
		playlist.Tracks.Total,
	)
	return err
}
