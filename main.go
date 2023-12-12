package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"
)

// MessageBody is the request body for the /message endpoint
type MessageBody struct {
	Messages []openai.ChatCompletionMessage `json:"messages"`
}

// StreamMessage is the message sent to the client via SSE
type StreamMessage struct {
	Timestamp int64  `json:"timestamp"`
	Content   string `json:"content"`
}

func main() {
	// Create a new Gin router
	router := gin.Default()

	// Create Open AI client
	apiKey := os.Getenv("OA_API_KEY")
	client := openai.NewClient(apiKey)

	// Apply CORS middleware
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	router.Use(cors.New(config))

	// Resolver endpoints
	router.POST("/message", func(c *gin.Context) {
		// Receive messages from request body
		var messageBody MessageBody
		c.BindJSON(&messageBody)

		// Create open ai chat completion request
		req := openai.ChatCompletionRequest{
			Model:    openai.GPT3Dot5Turbo,
			Messages: messageBody.Messages,
			Stream:   true,
		}

		// As we receive messages from the Open AI Stream, we will send them to the client via this channel
		stream := make(chan *StreamMessage, 10)

		go func() {
			// close the channel when we know we're done (when this go func exits)
			defer close(stream)
			// Stream the response as tokens are generated
			openAIStream, err := client.CreateChatCompletionStream(context.Background(), req)
			if err != nil {
				fmt.Printf("ChatCompletionStream error: %v\n", err)
				return
			}
			defer openAIStream.Close()

			for {
				// Read chunks from the stream, as they become available
				response, err := openAIStream.Recv()
				if errors.Is(err, io.EOF) {
					// fmt.Println("\nStream finished")
					return
				}

				if err != nil {
					fmt.Printf("\nStream error: %v\n", err)
					return
				}

				// Send the response to the client
				stream <- &StreamMessage{
					Timestamp: response.Created,
					Content:   response.Choices[0].Delta.Content,
				}
			}
		}()

		c.Stream(func(w io.Writer) bool {
			if msg, ok := <-stream; ok {
				c.SSEvent("message", msg)
				return true
			}
			return false
		})
	})

	// Start the server
	router.Run(":8080")
}
