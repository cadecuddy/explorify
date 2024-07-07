FROM golang:1.23-rc-alpine

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o /app/explorify-processor

# FROM alpine:latest

EXPOSE 3002

# WORKDIR /app
# COPY --from=build /app/explorify .

CMD ["./explorify-processor"]