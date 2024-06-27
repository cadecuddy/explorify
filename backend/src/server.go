package main

import (
	"io"
	"os"

	"github.com/cadecuddy/explorify/src/pkg/api"
	"github.com/cadecuddy/explorify/src/pkg/utils"
	"github.com/gin-gonic/gin"
)

func main() {
	// gin.SetMode(gin.ReleaseMode)
	logsFile, _ := os.OpenFile("gin.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	gin.DefaultWriter = io.MultiWriter(logsFile, os.Stdout)

	// ping data stores so that healthcheck can pass on first query

	r := gin.Default()

	r.GET("/healthcheck", utils.HealthCheck)

	r.POST("/playlists", api.HandlePlaylists)

	// set port to 3001
	r.Run(":3001")
}
