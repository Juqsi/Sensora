"""
This script is used to clean up dataset directories by deleting class folders that contain fewer than a specified
minimum number of images. Three directories are processed: images_train, images_val, and images_test from the PlantNet
300K dataset.
First, class folders that are too small are deleted from the training dataset. Then, the same folders are removed from
the validation and test datasets.
"""

import os
import shutil

# Verzeichnisse definieren

TRAIN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/plantnet_300K/images_train"))
if not os.path.exists(TRAIN_DIR):
    os.makedirs(TRAIN_DIR, exist_ok=True)
VAL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/plantnet_300K/images_val"))
if not os.path.exists(VAL_DIR):
    os.makedirs(VAL_DIR, exist_ok=True)
TEST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/plantnet_300K/images_test"))
if not os.path.exists(TEST_DIR):
    os.makedirs(TEST_DIR, exist_ok=True)

# Mindestanzahl an Bildern pro Klasse
MIN_IMAGES = 5


def delete_small_folders(base_dir, min_images):
    """
    Deletes subfolders in the given base directory that contain fewer than 'min_images' files.

    Iterates over all subfolders in 'base_dir' and removes those that contain fewer than 'min_images' files.
    Only folders that actually exist and contain files are considered.

    Args:
        base_dir (str): The directory to search for subfolders in.
        min_images (int): The minimum number of files a subfolder must contain to avoid deletion.

    Returns:
        list: A list of names of the deleted subfolders.
    """
    deleted_folders = []

    for class_folder in os.listdir(base_dir):
        class_path = os.path.join(base_dir, class_folder)

        if os.path.isdir(class_path):
            num_files = len([f for f in os.listdir(class_path) if os.path.isfile(os.path.join(class_path, f))])

            if num_files < min_images:
                shutil.rmtree(class_path)
                deleted_folders.append(class_folder)
                print(f"Deleted: {class_path} (only {num_files} files)")

    return deleted_folders


# Lösche zu kleine Ordner in images_train
deleted_classes = delete_small_folders(TRAIN_DIR, MIN_IMAGES)

# Lösche die gleichen Ordner in images_val und images_test
for dataset_dir in [VAL_DIR, TEST_DIR]:
    for class_folder in deleted_classes:
        class_path = os.path.join(dataset_dir, class_folder)

        if os.path.isdir(class_path):
            shutil.rmtree(class_path)
            print(f"Deleted: {class_path}")

print("Cleanup complete.")
