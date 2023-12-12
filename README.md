# Open AI HTTP Proxy (Stream)

A simple HTTP proxy which allows you to stream responses from Open AI's API. This can be used to secure your API key and to add additional functionality to your API calls.

### Medium article

[Streaming Open AI API responses with Server-Side Events and Golang](https://medium.com/@nick.sjostrom12/streaming-openai-api-from-a-proxy-server-8d9e01c0f2f1)

[<img src="https://miro.medium.com/v2/resize:fit:720/format:webp/1*VMQmzlL8MMYjRoTo2VDm8g.png" width="400">](https://medium.com/@nick.sjostrom12/streaming-openai-api-from-a-proxy-server-8d9e01c0f2f1)

## Run the proxy

```bash
# Set your API key
$ export OA_API_KEY=sk-...

# Run the proxy
$ go run main.go
```

## Run the proxy with Docker

```bash
# Build the image
$ docker build -t openai-proxy .

# Run the image
$ docker run -p 8080:8080 -e OA_API_KEY=sk-... openai-proxy
```

## Usage

```bash
curl -s -N -X POST -d '{"messages": [{"role": "user", "content": "Hello world!"}]}' http://localhost:8080/message

event:message
data:{"timestamp":1702330536,"content":""}

event:message
data:{"timestamp":1702330536,"content":"Hello"}

event:message
data:{"timestamp":1702330536,"content":"!"}

event:message
data:{"timestamp":1702330536,"content":" How"}

event:message
data:{"timestamp":1702330536,"content":" can"}

event:message
data:{"timestamp":1702330536,"content":" I"}

event:message
data:{"timestamp":1702330536,"content":" assist"}

event:message
data:{"timestamp":1702330536,"content":" you"}

event:message
data:{"timestamp":1702330536,"content":" today"}

event:message
data:{"timestamp":1702330536,"content":"?"}

event:message
data:{"timestamp":1702330536,"content":""}
```
