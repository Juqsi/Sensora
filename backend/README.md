# Setup
Vor dem Start des Programms muss ein PostgreSQL laufen. Führe dazu folgenden Befehl aus:
```shell
docker run -p 5432:5432 --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```
Nachdem die Datenbank läuft, konfiguriere diese, indem du das [setup-script](database_setup.sql) ausführst.

# Run
Um die Frontend-API in einem docker container zu starten, führe folgenden Befehl aus:
```shell
docker run -p 8080:8080 -e DATABASE_URL=postgres://postgres:mysecretpassword@172.17.0.2:5432/sensora comtols/sensora-frontend-api
```