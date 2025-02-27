FROM rust:latest as builder
WORKDIR /app
ARG GIT_TOKEN
ENV GIT_TOKEN=${GIT_TOKEN}
RUN git clone https://oauth2:$GIT_TOKEN@gitlab.maxtar.de/sensora/frontend-api.git .
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
  libssl-dev \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/bin

COPY --from=builder /app/target/release/Sensora /usr/local/bin/Sensora

WORKDIR /App

EXPOSE 8080

CMD ["/usr/local/bin/Sensora"]
