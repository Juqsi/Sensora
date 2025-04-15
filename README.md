# Sensora

**Sensora** ist ein Projekt zur Entwicklung einer intelligenten Bewässerungslösung für den privaten Innenbereich. Das System kombiniert moderne Ansätze aus den Bereichen IoT, Web-Entwicklung, Künstliche Intelligenz und Microservices, um eine ressourcenschonende und bedarfsgerechte Pflanzenbewässerung zu realisieren.

## Projektübersicht

Sensora erfasst mithilfe von Sensoren (z. B. Bodenfeuchte, Temperatur, Luftfeuchtigkeit, Lichtintensität) präzise Umgebungsdaten, die zur automatischen oder manuellen Steuerung der Bewässerung genutzt werden. Das Projekt wurde im Rahmen einer Studienarbeit an der Dualen Hochschule Baden-Württemberg Mannheim entwickelt und legt besonderen Wert auf agile Entwicklungsmethoden und moderne Systemarchitekturen.

## Verzeichnisstruktur

- **/frontend**  
  Enthält den Quellcode für die Web-Oberfläche zur Visualisierung der Sensordaten und zur Steuerung der Bewässerungsfunktionen.  
  (Detaillierte Anweisungen findest Du in der README im Ordner.)

- **/backend**  
  Beinhaltet die serverseitige Logik, REST-APIs, Datenverarbeitung, Authentifizierung und Logging.  
  (Siehe README im Ordner für weitere Informationen.)

- **/iot**  
  Enthält den Firmware-Code für den Mikrocontroller, der die Sensordaten erfasst und die Bewässerung steuert.  
  (Details sind in der dortigen README dokumentiert.)

- **/KI-Komponente**  
  Umfasst die KI-basierte Lösung zur Pflanzenklassifikation und Umgebungsanalyse (z. B. unter Einsatz tiefer neuronaler Netze wie ResNet).  
  (Ausführliche Informationen findest Du in der README im Ordner.)

- **/sensora service**  
  Beinhaltet einzelne Microservices, die spezifische Funktionen (z. B. Authentifizierung, E-Mail-Verifikation, Datenpersistierung, Setpoint API) kapseln und eine skalierbare Systemintegration ermöglichen.  
  (Jeder Microservice verfügt über eine eigene README.)

## Dokumentation

Für umfassende Informationen zur Konzeption, Implementierung und Evaluation des Projekts steht die [Studienarbeit (Sensora-Github.pdf)](./Ausarbeitung/Sensora.pdf) zur Verfügung.

## Mitwirkende

Dieses Projekt wurde als Studienarbeit an der Dualen Hochschule Baden-Württemberg Mannheim realisiert.  
**Autoren:** Max, Fynn, Justus, Lukas, Timon
