package api

import (
	"fmt"

	"github.com/cadecuddy/explorify/internal/database"
	"github.com/gin-gonic/gin"
)

func GetPlaylistsByGenre(c *gin.Context) {
	genre := c.Query("genre")
	if genre == "" {
		c.JSON(400, gin.H{
			"error": "genre query parameter is required",
		})
		return
	}

	playlists, err := getPlaylistsByGenreFromDatabase(genre)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "failed to get genres",
		})
		return
	}

	c.JSON(200, gin.H{
		"playlists": playlists,
	})
}

func getPlaylistsByGenreFromDatabase(genre string) ([]Playlist, error) {
	// SQL query to fetch all genre names
	query := `SELECT p.id, p.description, p.url, p.followers, p.image, p.name, p.owner_url, p.owner_displayName, p.tracks_total
	FROM Playlist p
	JOIN PlaylistGenre pg ON p.id = pg.playlist_id
	JOIN Genre g ON pg.genre_id = g.id
	WHERE g.name = ?`

	db, err := database.GetConnection()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}

	rows, err := db.Query(query, genre)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

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

func GetGenres(c *gin.Context) {
	// get access token from auth header and split to remove "Bearer "
	// accessToken := c.GetHeader("Authorization")[7:]

	// fmt.Println(accessToken)

	genres, err := getGenresFromDatabase()
	if err != nil {
		c.JSON(500, gin.H{
			"error": "failed to get genres",
		})
		return
	}

	c.JSON(200, gin.H{
		"genres": genres,
	})
}

func getGenresFromDatabase() ([]string, error) {
	// SQL query to fetch all genre names
	query := `SELECT name FROM Genre`

	db, err := database.GetConnection()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}

	// Execute the query
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	// Slice to store the genre names
	var genres []string

	// Iterate through the rows
	for rows.Next() {
		var genre string
		if err := rows.Scan(&genre); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		genres = append(genres, genre)
	}

	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}

	return genres, nil
}
