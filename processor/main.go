package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/cadecuddy/explorify-processor/pkg/database"
	"github.com/cadecuddy/explorify-processor/pkg/utils"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

// Similar to failOnError, but marks the message
// as not-consumed so it can be tried again
func failWhileConsuming(err error, msg string, d amqp.Delivery) {
	if err != nil {
		d.Nack(false, false)
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitmqUser := os.Getenv("RABBITMQ_DEFAULT_USER")
	rabbitmqPass := os.Getenv("RABBITMQ_DEFAULT_PASS")

	db, err := database.GetConnection()
	failOnError(err, "Couldn't connect to MySQL from consumer")

	conn, connErr := amqp.Dial("amqp://" + rabbitmqUser + ":" + rabbitmqPass + "@rabbitmq")
	failOnError(connErr, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"playlists-to-process",
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to declare a queue")

	err = ch.Qos(
		1,
		0,
		false,
	)
	failOnError(err, "Failed to set QoS")

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to register a consumer")

	var forever chan struct{}

	// Listen for playlist ID messages in the queue and fetch all the tracks for each playlist
	go func() {
		for d := range msgs {
			playlist, err := utils.GetPlaylistFromMessage(d)
			failWhileConsuming(err, "Error fetching playlist", d)

			tracks, err := utils.FetchTracks(d)
			failWhileConsuming(err, "Error fetching tracks", d)

			accessToken, err := utils.GetAccessTokenFromMessage(d)
			failWhileConsuming(err, "Error getting access token from message", d)

			// classify playlist genre based on track artists in playlist
			genres, _ := utils.GetPlaylistGenre(tracks, accessToken)

			// INSERT TRACKS INTO DATABASE, BATCH
			err = database.InsertTracks(db, *playlist, tracks)
			failWhileConsuming(err, "Error inserting tracks into DB", d)

			err = database.InsertPlaylist(db, *playlist, genres)
			failWhileConsuming(err, "Error inserting playlist into DB", d)

			time.Sleep(200 * time.Millisecond)
			d.Ack(false)

			fmt.Printf("Processed playlist: %s\n", playlist.Name)
		}
	}()

	log.Printf(" [*] Waiting for messages.")
	<-forever
}
