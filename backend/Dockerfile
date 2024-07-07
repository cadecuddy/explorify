FROM golang:1.23-rc-alpine

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o /app/explorify

# FROM alpine:latest

EXPOSE 3001

# WORKDIR /app
# COPY --from=build /app/explorify .

CMD ["./explorify"]