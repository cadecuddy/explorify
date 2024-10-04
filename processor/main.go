package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/cadecuddy/explorify-processor/internal/database"
	"github.com/cadecuddy/explorify-processor/internal/types"
	"github.com/cadecuddy/explorify-processor/internal/utils"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitmqHost := os.Getenv("RABBITMQ_SERVER_NAME")
	rabbitmqUser := os.Getenv("RABBITMQ_DEFAULT_USER")
	rabbitmqPass := os.Getenv("RABBITMQ_DEFAULT_PASS")

	db, err := database.GetConnection()
	failOnError(err, "Couldn't connect to MySQL from consumer")

	conn, connErr := amqp.Dial("amqp://" + rabbitmqUser + ":" + rabbitmqPass + "@" + rabbitmqHost)
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
			var message types.PlaylistMessage
			err := json.Unmarshal(d.Body, &message)
			if err != nil {
				log.Printf("Error unmarshalling message: %s", err)
			}

			playlist, err := utils.GetPlaylistFromMessage(message)
			if err != nil {
				log.Printf("Error getting playlist from message: %s", err)
				d.Nack(false, false)
				continue
			}

			tracks, err := utils.FetchTracks(message)
			if err != nil {
				log.Printf("Error fetching tracks: %s", err)
				d.Nack(false, false)
				continue
			}

			// classify playlist genre based on track artists in playlist
			genres, _ := utils.GetPlaylistGenre(tracks, message.AccessToken)

			// INSERT TRACKS INTO DATABASE, BATCH
			err = database.InsertTracks(db, *playlist, tracks)
			if err != nil {
				log.Printf("Error inserting tracks into DB: %s", err)
				d.Nack(false, true)
				continue
			}

			err = database.InsertPlaylist(db, *playlist, genres)
			if err != nil {
				log.Printf("Error inserting playlist into DB: %s", err)
				d.Nack(false, true)
				continue
			}

			time.Sleep(200 * time.Millisecond)
			d.Ack(false)

			fmt.Printf("Processed playlist: %s - IS PUBLIC: %v\n", playlist.Name, playlist.IsPublic)
		}
	}()

	log.Printf(" [*] Waiting for messages.")
	<-forever
}
