package database

import (
	"database/sql"
	"fmt"
	"strings"

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

func InsertTracks(db *sql.DB, playlist spotify.FullPlaylist, tracks []spotify.PlaylistTrack) error {
	if len(tracks) == 0 {
		return nil
	}

	trackQuery := `
	INSERT IGNORE INTO Track (id, name, album_id, duration, explicit, external_urls, preview_url, uri, type)
	VALUES
	`

	trackToPlaylistQuery := `
	INSERT IGNORE INTO TrackToPlaylist (track_id, playlist_id)
	VALUES
	`

	trackValues := []interface{}{}
	trackToPlaylistValues := []interface{}{}

	for _, track := range tracks {
		// Skip if the track ID is missing
		if track.Track.ID.String() == "" {
			continue
		}
		if track.Track.Album.ID.String() == "" {
			track.Track.Album.ID = "UNKNOWN"
		}
		if track.Track.ExternalURLs["spotify"] == "" {
			track.Track.ExternalURLs["spotify"] = "UNKNOWN"
		}

		trackQuery += "(?, ?, ?, ?, ?, ?, ?, ?, ?),"
		trackValues = append(trackValues,
			track.Track.ID.String(),
			track.Track.Name,
			track.Track.Album.ID.String(),
			track.Track.Duration,
			track.Track.Explicit,
			track.Track.ExternalURLs["spotify"],
			track.Track.PreviewURL,
			track.Track.URI,
			track.Track.Type,
		)

		trackToPlaylistQuery += "(?, ?),"
		trackToPlaylistValues = append(trackToPlaylistValues,
			track.Track.ID.String(),
			playlist.ID.String(),
		)
	}

	if len(trackValues) == 0 || len(trackToPlaylistValues) == 0 {
		fmt.Println("No valid track values to insert")
		return nil
	}

	trackQuery = strings.TrimSuffix(trackQuery, ",")
	trackToPlaylistQuery = strings.TrimSuffix(trackToPlaylistQuery, ",")

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	trackStmt, err := tx.Prepare(trackQuery)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer trackStmt.Close()

	_, err = trackStmt.Exec(trackValues...)
	if err != nil {
		tx.Rollback()
		return err
	}

	trackToPlaylistStmt, err := tx.Prepare(trackToPlaylistQuery)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer trackToPlaylistStmt.Close()

	_, err = trackToPlaylistStmt.Exec(trackToPlaylistValues...)
	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
