package utils

import (
	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "i am alive from explorify :D",
	})
}