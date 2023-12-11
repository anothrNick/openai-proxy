# Open AI HTTP Proxy (Stream)

A simple HTTP proxy which allows you to stream responses from Open AI's API. This can be used to secure your API key and to add additional functionality to your API calls.

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
