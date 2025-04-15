# Übersicht des Projekts: Bildklassifikation mit PlantNet 300K

Dieses Repository enthält mehrere Skripte und Module, die den vollständigen Workflow für die Bildklassifikation mit dem PlantNet 300K Datensatz abdecken. Die enthaltenen Dateien unterstützen Sie dabei, den Datensatz vorzubereiten, Modelle zu trainieren und zu evaluieren sowie fehlerhafte oder doppelte Klassen zu bereinigen bzw. zusammenzuführen.


## Dateibeschreibungen

### `train.py`
- **Funktion:** Implementiert den Trainingsprozess für ein CNN zur Bildklassifikation.
- - Konfigurierung mit `config.py`
- **Highlights:**
  - Datentransformationen und -augmentation (Resize, Random Crop, RandAugment, etc.)
  - Implementierung von Focal Loss, Mixup und CutMix
  - Nutzung von Weighted Sampling zur Behandlung von Klassenungleichgewichten
  - Trainings- und Validierungsschleifen mit Logging von Verlust und Genauigkeit
  - Checkpoint-Speicherung und Visualisierung des Trainingsfortschritts

### `checkpoint_utils.py`
- **Funktion:** Enthält Utility-Funktionen zum Speichern und Laden von Modell-Checkpoints.
- **Highlights:**
  - `save_checkpoint`: Speichert den Zustand von Modell und Optimizer zusammen mit der aktuellen Epoche.
  - `load_checkpoint`: Lädt einen gespeicherten Checkpoint und stellt den Trainingszustand wieder her.

### `stats.py`
- **Funktion:** Stellt Methoden zur Evaluierung des Modells zur Verfügung.
- **Highlights:**
  - `save_confusion_matrix`: Berechnet und speichert normalisierte Confusion Matrices als Bild- und CSV-Dateien, inklusive der häufigsten Fehlklassifikationen.
  - `plot_training_progress`: Erstellt Diagramme, die den Verlauf von Trainings- und Validierungsgenauigkeiten anzeigen. 

### `confusion_analyse.py`
- **Funktion:** Dieses Skript analysiert normalisierte Confusion Matrices aus verschiedenen Trainings-Epochen,
ermittelt die häufigsten Fehlklassifikatione und erstellt
eine Übersicht.


### `mymodel.py`
- **Funktion:** Definiert ein benutzerdefiniertes Convolutional Neural Network (CNN) für die Bildklassifikation.
- **Highlights:**
  - Mehrere Convolutional-Blöcke mit Batch-Normalisierung, ReLU-Aktivierung und Dropout
  - Adaptive Pooling und voll verbundene Schichten (Fully Connected Layers) für die finale Klassifikation

### `finetuning.py`
- **Funktion:** Führt das Finetuning eines ResNet50-Modells durch.
- Konfigurierung mit `ft_config.py`
- **Highlights:**
  - Laden eines Basis-Checkpoints und Anpassen der Fully-Connected-Schicht an die gemergten Klassen
  - Festlegen der trainierbaren Schichten (z. B. Layer3, Layer4 und die neue FC-Schicht)
  - Trainings- und Validierungsschleifen mit Checkpoint-Speicherung und Evaluierung (Confusion Matrix)
  - Speicherung des finalen Modells und der Trainingskonfiguration

### `create_merge_map.py`
- **Funktion:** Erzeugt eine Merge Map zur Zusammenführung von doppelten oder sehr ähnlichen Klassen im PlantNet 300K Datensatz.
- **Highlights:**
  - Gruppierung von Klassen basierend auf exakten Namensübereinstimmungen
  - Optionale Nutzung von Fuzzy Matching (mit konfigurierbarem Schwellenwert), um zusätzlich ähnlich klingende Klassen zu mergen
  - Speicherung der Merge Map als JSON-Datei

### `clean_dataset.py`
- **Funktion:** Bereinigt den Datensatz, indem Klassenordner entfernt werden, die weniger als eine definierte Mindestanzahl an Bildern enthalten.
- **Highlights:**
  - Durchsucht die Verzeichnisse für Trainings-, Validierungs- und Testdaten
  - Löscht Klassenordner, die nicht genügend Bilddateien enthalten, um eine stabile Modellperformance zu gewährleisten

## Nutzung

1. **Dataset Downloaden:**  
   [Dataset](https://zenodo.org/records/4726653#.YhNbAOjMJPY) herunterladen und in `dataset` einfügen. 

2. **Checkpoint Ordner erstellen:**  
   Erstelle einen Ordner `checkpoints` unter `ai_training`.

3. **Datenbereinigung:**  
   Führen Sie `clean_dataset.py` aus, um den Datensatz von Klassen mit zu wenigen Bildern zu bereinigen.

4. **Training:**  
   Starten Sie das Training mit `train.py`, um Ihr CNN-Modell zu trainieren. Nutze ggf. bei einer AMD GPU den Dockercontainer.

5. **Merge Map erstellen:**  
   Nutzen Sie `create_merge_map.py`, um eine Merge Map zu generieren, die ähnliche oder doppelte Klassen zusammenführt.

6. **Evaluierung:**  
   Verwenden Sie die in `confusion.py` bereitgestellten Funktionen, um problematische Klassen zu analysieren.

7. **Finetuning:**  
   Passen Sie ein vortrainiertes Modell an, indem Sie `finetuning.py` ausführen.
