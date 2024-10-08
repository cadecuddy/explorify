package rabbitmq

import (
	"os"
	"sync"

	"github.com/cadecuddy/explorify/internal/utils"
	amqp "github.com/rabbitmq/amqp091-go"
)

var (
	conn       *amqp.Connection
	ch         *amqp.Channel
	once       sync.Once
	connErr    error
	channelErr error
)

// GetMessageQueueChannel returns a singleton connection to the RabbitMQ channel
func GetMessageQueueChannel() (*amqp.Channel, error) {
	once.Do(func() {
		rabbitmqHost := os.Getenv("RABBITMQ_SERVER_NAME")
		rabbitmqUser := os.Getenv("RABBITMQ_DEFAULT_USER")
		rabbitmqPass := os.Getenv("RABBITMQ_DEFAULT_PASS")

		conn, connErr = amqp.Dial("amqp://" + rabbitmqUser + ":" + rabbitmqPass + "@" + rabbitmqHost)

		utils.FailOnError(connErr, "Error connecting to Rabbitmq")

		ch, channelErr = conn.Channel()
		utils.FailOnError(channelErr, "Error connecting to Rabbitmq Channel")

		// Declare the queue that will be used to send playlists to be processed
		ch.QueueDeclare(
			"playlists-to-process",
			true,
			false,
			false,
			false,
			nil,
		)
	})
	return ch, channelErr
}
