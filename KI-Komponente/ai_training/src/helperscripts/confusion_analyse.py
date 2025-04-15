"""
This script analyzes normalized confusion matrices from different training epochs,
identifies the most frequent misclassifications (with a threshold > 0.2), and creates
an overview that checks whether the confused classes belong to the same genus.

The following steps are performed:
1. Loading species names from a JSON file.
2. Defining file paths to the CSV files containing the normalized confusion matrices.
3. Iterating through the CSV files to find the most frequent misclassification for each true class.
4. Merging the results across all epochs.
5. Creating a DataFrame that indicates whether the confused classes belong to the same genus.
"""

import json
import pandas as pd
import os

with open(os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "../../dataset/plantnet_300K/plantnet300K_species_names.json"
        )), "r", encoding="utf-8") as f:
    species_names = json.load(f)

conf_matrix_files = [
    "/confusion_matrix_normalized_epoch_20.csv",
    "/confusion_matrix_normalized_epoch_30.csv",
    "/confusion_matrix_normalized_epoch_40.csv",
    "/confusion_matrix_normalized_epoch_50.csv",
    "/confusion_matrix_normalized_epoch_60.csv",
    "/confusion_matrix_normalized_epoch_70.csv",
    "/confusion_matrix_normalized_epoch_80.csv",
    "/confusion_matrix_normalized_epoch_90.csv",
    "/confusion_matrix_normalized_epoch_100.csv",
    "/confusion_matrix_normalized_epoch_110.csv"
]

most_confused = {}

for file in conf_matrix_files:
    df = pd.read_csv("./checkpoints" + file, index_col=0)
    df.columns = df.columns.astype(str)
    df.index = df.index.astype(str)

    df = df.loc[df.index.intersection(df.columns)]

    epoch = int(os.path.basename(file).split("_")[-1].split(".")[0])

    for true_label in df.index:
        top_confused = df.loc[true_label].drop(labels=[true_label], errors='ignore').sort_values(ascending=False).head(
            1)
        if not top_confused.empty and top_confused.values[0] > 0.2:
            most_likely = top_confused.idxmax()
            score = top_confused.values[0]
            most_confused.setdefault((true_label, most_likely), []).append((epoch, score))

confused_classes = []
for (true_id, confused_id), epochs in most_confused.items():
    true_name = species_names.get(true_id, "???")
    confused_name = species_names.get(confused_id, "???")

    true_genus = true_name.split()[0] if true_name != "???" else "???"
    confused_genus = confused_name.split()[0] if confused_name != "???" else "???"

    same_genus = true_genus == confused_genus

    confused_classes.append({
        "true_id": true_id,
        "true_name": true_name,
        "confused_with_id": confused_id,
        "confused_with_name": confused_name,
        "same_genus": same_genus,
        "epochs": epochs
    })

df_confused = pd.DataFrame(confused_classes)
print(df_confused)