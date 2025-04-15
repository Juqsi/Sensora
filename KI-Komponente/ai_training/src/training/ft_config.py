"""
This script contains the configuration settings for training and fine-tuning a deep learning model using PyTorch.

It defines the file paths, hyperparameters, and options for data loading, training, and model checkpointing.

Paths:
    - **DATA_DIR**: Directory containing the dataset (e.g., images for training, validation, and testing).
    - **MODEL_DIR**: Directory where pre-trained models are stored.
    - **CHECKPOINT_DIR**: Directory for saving and loading model checkpoints.
    - **PRETRAINED_MODEL_PATH**: Path to the pre-trained ResNet50 model for fine-tuning.
    - **PREVIOUS_CHECKPOINT**: Path to the checkpoint for resuming training from a specific epoch.
    - **MERGE_MAP_PATH**: Path to the JSON file for the merge map used in the model.

Training Parameters:
    - **BATCH_SIZE**: Number of samples per batch during training.
    - **LEARNING_RATE**: Learning rate for the optimizer.
    - **EPOCHS**: Total number of epochs to train the model.
    - **WEIGHT_DECAY**: Regularization parameter to prevent overfitting.
    - **NUM_WORKERS**: Number of workers to use for data loading in parallel.
    - **DEVICE**: The computation device, either 'cuda' for GPU or 'cpu' for CPU.

Checkpointing:
    - **CHECKPOINT_PATH**: Path format for saving the model checkpoint at each epoch.
    - **RESUME_TRAINING**: Flag indicating whether to resume training from the previous checkpoint.
    - **LAST_EPOCH**: The last epoch number if resuming training, to continue from the right point.

This configuration script provides a centralized place for controlling key aspects of the model training and
fine-tuning process, including dataset locations, hyperparameters, checkpointing, and pre-trained model usage.
"""

import os

import torch

# === Verzeichnisse ===
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/plantnet_300K"))
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models"))
CHECKPOINT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dcheckpoints"))
PRETRAINED_MODEL_PATH = os.path.join(MODEL_DIR, 'resnet50.pth')
# Vorheriger Trainingsstand für Finetuning
PREVIOUS_CHECKPOINT = os.path.join(CHECKPOINT_DIR, 'checkpoint_epoch_116.pth')
RESUME_TRAINING = False
LAST_EPOCH = 49


# === Datasets ===
TRAIN_DIR = os.path.join(DATA_DIR, 'images_train')
VAL_DIR = os.path.join(DATA_DIR, 'images_val')
TEST_DIR = os.path.join(DATA_DIR, 'images_test')

# === Trainingsparameter ===
BATCH_SIZE = 128
LEARNING_RATE = 1e-5
EPOCHS = 50
WEIGHT_DECAY = 0.0001
NUM_WORKERS = 12
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# === Checkpointing ===
CHECKPOINT_PATH = os.path.join(CHECKPOINT_DIR, 'finetune_checkpoint_epoch_{}.pth')

# === Merge-Konfiguration ===
MERGE_MAP_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../helperscripts/merge_map.json'))
