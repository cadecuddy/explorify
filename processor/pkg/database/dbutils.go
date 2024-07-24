package database

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/zmb3/spotify"
)

// Inserts a playlist into the database. If the playlist is already there
// all fields except for the ID are updated.
func InsertPlaylist(db *sql.DB, playlist spotify.FullPlaylist, topGenres []string) error {
	// Insert or update the playlist
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

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	_, err = tx.Exec(query,
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
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert or update playlist: %w", err)
	}

	// Insert genres and playlist-genre relationships
	for _, genre := range topGenres {
		genreID, err := insertGenre(tx, genre)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert genre: %w", err)
		}

		err = insertPlaylistGenre(tx, playlist.ID.String(), genreID)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert playlist-genre relationship: %w", err)
		}
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func insertGenre(tx *sql.Tx, genre string) (int, error) {
	// Try to insert the genre
	query := `
		INSERT INTO Genre (name) VALUES (?)
		ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
	`
	_, err := tx.Exec(query, genre)
	if err != nil {
		return 0, fmt.Errorf("failed to insert or retrieve genre: %w", err)
	}

	// Retrieve the ID of the inserted or existing genre
	var genreID int
	err = tx.QueryRow("SELECT LAST_INSERT_ID()").Scan(&genreID)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve genre ID: %w", err)
	}

	return genreID, nil
}

func insertPlaylistGenre(tx *sql.Tx, playlistID string, genreID int) error {
	query := `
		INSERT INTO PlaylistGenre (playlist_id, genre_id) VALUES (?, ?)
		ON DUPLICATE KEY UPDATE playlist_id = VALUES(playlist_id), genre_id = VALUES(genre_id)
	`
	_, err := tx.Exec(query, playlistID, genreID)
	if err != nil {
		return fmt.Errorf("failed to insert playlist-genre relationship: %w", err)
	}
	return nil
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
		// Skip if the track ID is missing or track is a local file
		if track.Track.ID.String() == "" || track.IsLocal {
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
