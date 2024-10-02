package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/cadecuddy/explorify/internal/database"
	"github.com/cadecuddy/explorify/internal/rabbitmq"
	"github.com/cadecuddy/explorify/internal/utils"
	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
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

type HandlePlaylistRequest struct {
	AccessToken string                 `json:"accessToken"`
	Playlists   []spotify.FullPlaylist `json:"playlists"`
}

type PlaylistMessage struct {
	AccessToken string `json:"access_token"`
	PlaylistId  string `json:"playlist_id"`
}

// Recieves logged in user's public playlists and forwards them to the processing queue
func SendPlaylistsToQueue(c *gin.Context) {
	var request HandlePlaylistRequest
	c.BindJSON(&request)

	// Send playlists to processing queue
	ch, err := rabbitmq.GetMessageQueueChannel()
	utils.FailOnError(err, "Failed to connect to RabbitMQ Channel")

	// publish all playlists to the processing queue
	for _, playlist := range request.Playlists {
		// check if playlist snapshot_id is the same, if it is, skip it
		sameSnapshotId, err := checkSnapshotIdIsSame(playlist.ID.String(), playlist.SnapshotID)
		// TODO: change this call to batch get all snapshot ids?
		if err != nil {
			log.Println("Failed to check if snapshot_id is the same")
			log.Println(err)
			continue
		}

		if sameSnapshotId {
			log.Println("Playlist snapshot_id is the same, skipping")
			continue
		}

		message := PlaylistMessage{
			AccessToken: request.AccessToken,
			PlaylistId:  string(playlist.ID),
		}

		messageBody, err := json.Marshal(message)
		if err != nil {
			utils.FailOnError(err, "Failed to marshal playlist message")
			continue
		}

		err = ch.Publish(
			"",
			"playlists-to-process",
			false,
			false,
			amqp.Publishing{
				ContentType: "application/json",
				Body:        messageBody,
			},
		)
		utils.FailOnError(err, "Failed to publish a message")
	}

	c.JSON(200, gin.H{
		"status": "playlists received",
	})
}

type FindPlaylistsWithTracksRequest struct {
	AccessToken string   `json:"accessToken"`
	TrackIds    []string `json:"tracks"`
}

func FindPlaylistsWithTracks(c *gin.Context) {
	var request FindPlaylistsWithTracksRequest
	c.BindJSON(&request)

	playlists, err := getPlaylistsFromTracks(request.TrackIds)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Failed to get playlists",
		})
		log.Println(err)
		return
	}

	c.JSON(200, gin.H{
		"playlists": playlists,
	})
}

// Queries for all playlists in the database that have the provided track ids in common
func getPlaylistsFromTracks(trackIds []string) ([]Playlist, error) {
	db, err := database.GetConnection()
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

// checks if the snapshot_id is the same as the one in the database
func checkSnapshotIdIsSame(playlistId string, currentSnapshotId string) (bool, error) {
	db, err := database.GetConnection()
	if err != nil {
		return false, err
	}

	var dbSnapshotId string
	err = db.QueryRow("SELECT snapshot_id FROM Playlist WHERE id = ?", playlistId).Scan(&dbSnapshotId)
	if err == sql.ErrNoRows {
		// if there's no existing row, snapshot id can't be the same
		return false, nil
	} else if err != nil {
		return false, err
	}

	return dbSnapshotId == currentSnapshotId, nil
}
