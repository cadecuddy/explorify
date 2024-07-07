package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/zmb3/spotify"
)

const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/playlists/"

type PlaylistMessage struct {
	PlaylistId  string `json:"playlistId"`
	AccessToken string `json:"accessToken"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitmqUser := os.Getenv("RABBITMQ_DEFAULT_USER")
	rabbitmqPass := os.Getenv("RABBITMQ_DEFAULT_PASS")

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

	go func() {
		for d := range msgs {
			var message PlaylistMessage
			err := json.Unmarshal(d.Body, &message)
			if err != nil {
				log.Printf("Error unmarshalling message: %s", err)
				d.Nack(false, true)
				continue
			}

			client := &http.Client{}
			req, err := http.NewRequest("GET", PLAYLIST_ENDPOINT+message.PlaylistId+"/tracks?offset=0&limit=100", nil)
			if err != nil {
				log.Printf("Error creating request: %s", err)
				d.Nack(false, true)
				continue
			}
			req.Header.Set("Authorization", "Bearer "+message.AccessToken)

			var tracks []spotify.PlaylistTrack
			offset := 0

			for {
				resp, err := client.Do(req)
				if err != nil {
					log.Printf("Error making request: %s", err)
					d.Nack(false, true)
					break
				}
				defer resp.Body.Close()

				if resp.StatusCode != http.StatusOK {
					log.Printf("Non-200 response: %d", resp.StatusCode)
					d.Nack(false, true)
					break
				}

				var playlistTracks spotify.PlaylistTrackPage
				err = json.NewDecoder(resp.Body).Decode(&playlistTracks)
				if err != nil {
					log.Printf("Error decoding response: %s", err)
					d.Nack(false, true)
					break
				}

				tracks = append(tracks, playlistTracks.Tracks...)
				if playlistTracks.Next == "" {
					break
				}
				offset += 100
				req.URL.RawQuery = "offset=" + strconv.Itoa(offset) + "&limit=100"
			}

			log.Printf("%s - Total tracks: %d", message.PlaylistId, len(tracks))
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Waiting for messages.")
	<-forever
}
