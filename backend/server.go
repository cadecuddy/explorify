package main

import (
	"github.com/cadecuddy/explorify/pkg/api"
	"github.com/cadecuddy/explorify/pkg/rabbitmq"
	"github.com/cadecuddy/explorify/pkg/utils"
	"github.com/gin-gonic/gin"
)

func main() {
	// gin.SetMode(gin.ReleaseMode)
	// logsFile, _ := os.OpenFile("../logs/gin.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	// gin.DefaultWriter = io.MultiWriter(logsFile, os.Stdout)

	// ping data stores so that healthcheck can pass on first query

	r := gin.Default()

	_, err := rabbitmq.GetMessageQueueChannel()
	utils.FailOnError(err, "Failed to connect to RabbitMQ")

	r.GET("/healthcheck", utils.HealthCheck)

	r.POST("/playlists/process", api.SendPlaylistsToQueue)

	// set port to 3001
	r.Run(":3001")
}
