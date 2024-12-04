FROM golang:1.23.2 AS builder

WORKDIR /app

COPY . .
RUN go mod tidy&& go build -o rest-api ./main/.

FROM scratch
COPY --from=builder /app/rest-api /app/

EXPOSE 3000

ENTRYPOINT [ "/app/rest-api" ]