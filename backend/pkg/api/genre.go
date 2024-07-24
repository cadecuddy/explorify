package api

import (
	"fmt"

	"github.com/cadecuddy/explorify/pkg/database"
	"github.com/gin-gonic/gin"
)

func GetGenres(c *gin.Context) {
	// get access token from auth header and split to remove "Bearer "
	// accessToken := c.GetHeader("Authorization")[7:]

	// fmt.Println(accessToken)

	genres, err := getGenres()
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

func getGenres() ([]string, error) {
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
