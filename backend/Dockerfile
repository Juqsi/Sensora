FROM rust:latest

WORKDIR /app

COPY . .

RUN cargo build --release

RUN mkdir -p /usr/local/bin
RUN mkdir -p /usr/local/bin/data

RUN mv target/release/Sensora /usr/local/bin/Sensora

RUN rm -R /app

WORKDIR /usr/local/bin

CMD ["/usr/local/bin/Sensora"]
