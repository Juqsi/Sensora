"""
This script creates a merge map for the PlantNet 300K species names.
It performs the following steps:
    1. Load species names from a JSON file.
    2. Group class entries based on exact name matches.
    3. Generate a merge map where duplicates are mapped to a primary ID.
    4. Optional: Use fuzzy matching to additionally identify and merge similar-sounding entries (above a threshold).
    5. Save the resulting merge map in a JSON file.
"""
import difflib
import json
import os
from collections import defaultdict

with open(
        os.path.join(
            os.path.dirname(__file__), os.path.join(
                os.path.dirname(__file__), "../../dataset/plantnet_300K/plantnet300K_species_names.json"
            )
        ), "r", encoding="utf-8") as f:
    class_map = json.load(f)

entries = [(cid, name.strip()) for cid, name in class_map.items()]

name_to_ids = defaultdict(list)
for cid, name in entries:
    name_to_ids[name].append(cid)

merge_map = {}
for name, ids in name_to_ids.items():
    if len(ids) > 1:
        primary_id = ids[0]
        for duplicate_id in ids[1:]:
            merge_map[duplicate_id] = primary_id


use_fuzzy_matching = True
fuzzy_threshold = 0.97

if use_fuzzy_matching:
    checked = set()
    for i, (cid1, name1) in enumerate(entries):
        for cid2, name2 in entries[i+1:]:
            if cid1 == cid2 or cid1 in merge_map or cid2 in merge_map:
                continue
            sim = difflib.SequenceMatcher(None, name1, name2).ratio()
            if sim > fuzzy_threshold:
                merge_map[cid2] = cid1
                checked.add((cid1, cid2))

with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "./merge_map.json")), "w", encoding="utf-8") as f:
    json.dump(merge_map, f, indent=4, ensure_ascii=False)

print(f"MMerge map with {len(merge_map)} entries saved as merge_map.json")
