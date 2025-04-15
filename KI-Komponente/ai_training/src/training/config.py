"""
This script contains the configuration settings for training a deep learning model using PyTorch.

It defines important paths, hyperparameters, and options for data preprocessing, training, and checkpoint management.

Paths:
    - **DATA_DIR**: Directory containing the dataset.
    - **MODEL_DIR**: Directory where the model is stored.
    - **CHECKPOINT_DIR**: Directory for saving and loading model checkpoints.
    - **PRETRAINED_MODEL_PATH**: Path to the pre-trained model to be used for transfer learning.
    - **TRAIN_DIR**, **VAL_DIR**, **TEST_DIR**: Directories containing the training, validation, and test datasets
    respectively.

Training Parameters:
    - **BATCH_SIZE**: Number of samples per batch during training.
    - **LEARNING_RATE**: Learning rate for the optimizer.
    - **EPOCHS**: Total number of epochs for training.
    - **DEVICE**: Computation device, either 'cuda' for GPU or 'cpu' for CPU.

Regularization and Augmentation:
    - **USE_MIXUP**: Whether to apply the MixUp augmentation technique.
    - **MIXUP_ALPHA**: Alpha value for MixUp, controlling the mixing strength.
    - **MIXUP_REDUCTION_EPOCH**: Epoch at which MixUp will be reduced.
    - **USE_CUTMIX**: Whether to apply the CutMix augmentation technique.
    - **CUTMIX_PROB**: Probability of applying CutMix during training.

Checkpointing and Resume Training:
    - **CHECKPOINT_PATH**: Path format for saving model checkpoints at each epoch.
    - **RESUME_TRAINING**: Whether to resume training from the last checkpoint.
    - **LAST_EPOCH**: Epoch from which to resume training.

Miscellaneous:
    - **NUM_WORKERS**: Number of workers for data loading in parallel.
    - **WEIGHT_DECAY**: Regularization parameter for the optimizer.

This configuration script ensures that the training process is streamlined and reproducible across different
environments.
"""
import os
import torch

# Verzeichnisse
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/plantnet_300K"))
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models"))
CHECKPOINT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../checkpoints"))

# Lokales Speichern des vortrainierten Modells
PRETRAINED_MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models/resenet50.pth"))

USE_MIXUP = False

MIXUP_ALPHA = 0.6
MIXUP_REDUCTION_EPOCH = 20

USE_CUTMIX = False
CUTMIX_PROB = 0.5


# Hyperparameter
BATCH_SIZE = 128
LEARNING_RATE = 5e-5
EPOCHS = 120
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Datasets
TRAIN_DIR = os.path.join(DATA_DIR, 'images_train')
VAL_DIR = os.path.join(DATA_DIR, 'images_val')
TEST_DIR = os.path.join(DATA_DIR, 'images_test')

# Checkpoints
CHECKPOINT_PATH = os.path.join(CHECKPOINT_DIR, 'checkpoint_epoch_{}.pth')
RESUME_TRAINING = True
LAST_EPOCH = 118

NUM_WORKERS = 12
WEIGHT_DECAY = 0.001
