import gc
import json
import os
import time
from datetime import datetime

import numpy as np
import torch
import torchvision.models as models
from torch import nn, optim
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms
from torchvision.models import ResNet50_Weights
from torchvision.transforms import RandAugment
from tqdm import tqdm

import config
from stats import save_confusion_matrix, plot_training_progress
from utils import save_checkpoint, load_checkpoint


class FocalLoss(nn.Module):
    """
    Focal Loss to improve learning of rare classes.

    This loss function reduces the impact of well-classified examples and focuses training
    more heavily on harder examples. It is often used in imbalanced classification problems.

    Args:
        alpha (float, optional): Scaling factor for Focal Loss. Default is 0.25.
        gamma (float, optional): Focusing parameter for weighting hard examples. Default is 2.0.
        reduction (str, optional): Method for aggregating the loss ('mean' or 'sum'). Default is 'mean'.
    """

    def __init__(self, alpha=0.25, gamma=2.0, reduction='mean'):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs, targets):
        """
        Calculates the Focal Loss between inputs and target classes.

        Args:
            inputs (Tensor): Model predictions (raw logits).
            targets (Tensor): Target classes.

        Returns:
            Tensor: Computed Focal Loss, aggregated according to the specified reduction method.
        """
        ce_loss = nn.CrossEntropyLoss(reduction='none')(inputs, targets)
        p_t = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - p_t) ** self.gamma * ce_loss
        return focal_loss.mean() if self.reduction == 'mean' else focal_loss.sum()


def mixup_data(x, y, alpha=0.4):
    """
    Applies Mixup data augmentation.

    This function mixes input data and target classes through a weighted combination of two examples,
    based on a Beta distribution with parameter alpha.

    Args:
        x (Tensor): Input data.
        y (Tensor): Target classes.
        alpha (float, optional): Parameter of the Beta distribution. Default is 0.4.

    Returns:
        tuple: (mixed_x, y_a, y_b, lam)
            - mixed_x (Tensor): Mixed input data.
            - y_a (Tensor): Original target classes.
            - y_b (Tensor): Target classes of the randomly selected example.
            - lam (float): Mixup coefficient determining the mixture ratio.
    """
    lam = np.random.beta(alpha, alpha)
    index = torch.randperm(x.size(0)).to(x.device)
    mixed_x = lam * x + (1 - lam) * x[index, :]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam


def mixup_criterion(criterion, pred, y_a, y_b, lam):
    """
    Calculates the loss for Mixup data augmentation.

    Combines the loss of two target classes based on the Mixup coefficient lam.

    Args:
        criterion (Callable): Loss function (e.g., CrossEntropyLoss).
        pred (Tensor): Model predictions.
        y_a (Tensor): First set of target classes.
        y_b (Tensor): Second set of target classes.
        lam (float): Mixup coefficient determining the mixture ratio.

    Returns:
        Tensor: Combined loss value.
    """
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)


def cutmix_box(width, height, lam):
    """
    Calculates the coordinates for the CutMix region.

    This function randomly determines a bounding box area within an image based on its
    dimensions and the Mixup coefficient lam, which controls the proportion of the cut-out area.

    Args:
        width (int): Image width.
        height (int): Image height.
        lam (float): Mixup coefficient controlling the size of the cut-out area.

    Returns:
        tuple: (bbx1, bby1, bbx2, bby2) – Coordinates of the bounding box.
    """
    cut_rat = np.sqrt(1. - lam)
    cut_w = int(width * cut_rat)
    cut_h = int(height * cut_rat)

    cx = np.random.randint(width)
    cy = np.random.randint(height)

    bbx1 = np.clip(cx - cut_w // 2, 0, width)
    bby1 = np.clip(cy - cut_h // 2, 0, height)
    bbx2 = np.clip(cx + cut_w // 2, 0, width)
    bby2 = np.clip(cy + cut_h // 2, 0, height)

    return bbx1, bby1, bbx2, bby2


def load_dataset(root_dir):
    """
    Loads a dataset from a directory and filters it by selected classes.

    This function uses ImageFolder, applies defined transformations, and filters the
    samples to include only those in 'selected_classes'.

    Args:
        root_dir (str): Path to the root directory of the dataset.

    Returns:
        Dataset: Filtered dataset with applied transformations and updated class mapping.
    """
    dataset = datasets.ImageFolder(root_dir, transform=transform)
    dataset.samples = [s for s in dataset.samples if dataset.classes[s[1]] in selected_classes]
    class_to_idx = {cls: i for i, cls in enumerate(selected_classes)}
    dataset.class_to_idx = class_to_idx
    dataset.samples = [(s[0], class_to_idx[dataset.classes[s[1]]]) for s in dataset.samples]
    dataset.classes = selected_classes
    return dataset


# Data transformation with augmentation
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(),
    RandAugment(num_ops=2, magnitude=9),  # oder magnitude=10 für aggressiver
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load datasets
selected_classes = os.listdir(config.TRAIN_DIR)
if '.DS_Store' in selected_classes:
    selected_classes.remove('.DS_Store')
print(len(selected_classes), selected_classes)

train_dataset = load_dataset(config.TRAIN_DIR)
val_dataset = load_dataset(config.VAL_DIR)
test_dataset = load_dataset(config.TEST_DIR)

# Weighted sampling for class balance
class_counts = [sum(1 for _, label in train_dataset.samples if label == idx) for idx in range(len(selected_classes))]
class_weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
sample_weights = [class_weights[label] for _, label in train_dataset.samples if label < len(selected_classes)]
sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

train_loader = DataLoader(train_dataset, batch_size=config.BATCH_SIZE, sampler=sampler, num_workers=config.NUM_WORKERS)
val_loader = DataLoader(val_dataset, batch_size=config.BATCH_SIZE, shuffle=False, num_workers=config.NUM_WORKERS)
test_loader = DataLoader(test_dataset, batch_size=config.BATCH_SIZE, shuffle=False, num_workers=config.NUM_WORKERS)


# Model (transfer learning with ResNet50)
if os.path.exists(config.PRETRAINED_MODEL_PATH):
    print("Load trained model from local memory...")
    model = models.resnet50()
    model.load_state_dict(torch.load(config.PRETRAINED_MODEL_PATH))
else:
    print("Load trained model from torchvision (needs more time)...")
    model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
    torch.save(model.state_dict(), config.PRETRAINED_MODEL_PATH)  # Save model locally

model.fc = nn.Linear(model.fc.in_features, len(selected_classes))
model = model.to(config.DEVICE)

for param in model.parameters():
    param.requires_grad = False  # Freeze all weights
for param in model.layer1.parameters():
    param.requires_grad = True
for param in model.layer2.parameters():
    param.requires_grad = True
for param in model.layer3.parameters():
    param.requires_grad = True  # 3. Free block of ResNet
for param in model.layer4.parameters():
    param.requires_grad = True  # 4. Free block of ResNet
for param in model.fc.parameters():
    param.requires_grad = True

# Optimization & loss
optimizer = optim.Adam(model.parameters(), lr=config.LEARNING_RATE, weight_decay=config.WEIGHT_DECAY)
criterion = FocalLoss(alpha=0.25, gamma=2.0)
scheduler = CosineAnnealingLR(optimizer, T_max=config.EPOCHS)

# If training continues
start_epoch = 0
if config.RESUME_TRAINING:
    checkpoint_path = config.CHECKPOINT_PATH.format(config.LAST_EPOCH)
    if os.path.exists(checkpoint_path):
        model, optimizer, start_epoch = load_checkpoint(model, optimizer, checkpoint_path, config.DEVICE)
        scheduler.last_epoch = start_epoch - 1

# Training
train_accuracy_list = []
accuracy_list = []
top5_accuracy_list = []
epoch_times = []
training_start_time = time.time()

print("start training")
for epoch in range(start_epoch, config.EPOCHS):
    if epoch >= config.MIXUP_REDUCTION_EPOCH and config.USE_MIXUP:
        config.MIXUP_ALPHA *= 0.95
        if config.MIXUP_ALPHA < 0.1:  # If alpha gets very small, deactivate Mixup
            config.USE_MIXUP = False
            print(f" Mixup deactivated from Epoch {epoch + 1}")

    epoch_start_time = time.time()
    gc.collect()
    torch.cuda.empty_cache()
    model.train()
    running_loss = 0.0
    correct, total = 0, 0

    tqdm_loader = tqdm(train_loader, desc=f"Epoch {epoch+1}/{config.EPOCHS}")  # Show progress

    for inputs, labels in tqdm_loader:
        inputs, labels = inputs.to(config.DEVICE), labels.to(config.DEVICE)
        optimizer.zero_grad()

        if config.USE_MIXUP:
            if config.USE_CUTMIX and np.random.rand() < config.CUTMIX_PROB:
                # CutMix
                lam = np.random.beta(config.MIXUP_ALPHA, config.MIXUP_ALPHA)
                rand_index = torch.randperm(inputs.size(0)).to(inputs.device)
                y_a, y_b = labels, labels[rand_index]
                bbx1, bby1, bbx2, bby2 = cutmix_box(inputs.size(2), inputs.size(3), lam)
                inputs[:, :, bbx1:bbx2, bby1:bby2] = inputs[rand_index, :, bbx1:bbx2, bby1:bby2]
                outputs = model(inputs)
                loss = mixup_criterion(criterion, outputs, y_a, y_b, lam)
            else:
                # Mixup
                inputs, y_a, y_b, lam = mixup_data(inputs, labels, config.MIXUP_ALPHA)
                outputs = model(inputs)
                loss = mixup_criterion(criterion, outputs, y_a, y_b, lam)
        else:
            # Standard-training without Mixup
            outputs = model(inputs)
            loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()
        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)

        # Show progress within epoch
        tqdm_loader.set_postfix(loss=loss.item(), acc=correct / total)

    epoch_loss = running_loss / len(train_loader)
    epoch_acc = correct / total
    train_accuracy_list.append(epoch_acc)

    # Validation
    model.eval()
    val_loss, val_correct, val_total = 0.0, 0, 0
    top5_correct = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(config.DEVICE), labels.to(config.DEVICE)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            val_correct += (predicted == labels).sum().item()
            # Top-5
            top5_preds = outputs.topk(5, dim=1).indices
            for pred, label in zip(top5_preds, labels):
                if label in pred:
                    top5_correct += 1
            val_total += labels.size(0)
    val_acc = val_correct / val_total
    accuracy_list.append(val_acc)
    top5_acc = top5_correct / val_total
    top5_accuracy_list.append(top5_acc)

    print(
        f"Epoch [{epoch}/{config.EPOCHS}], "
        f"Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.4f}, "
        f"Val Loss: {val_loss:.4f}, Val Acc (Top-1): {val_acc:.4f}, Top-5 Acc: {top5_acc:.4f}"
    )

    scheduler.step()
    save_checkpoint(model, optimizer, epoch, config.CHECKPOINT_PATH.format(epoch))
    if (epoch + 1) % 10 == 0 or epoch == 0:
        print("save confusion Matrix")
        save_confusion_matrix(model, val_loader, selected_classes, config.DEVICE, epoch + 1, config.CHECKPOINT_DIR)
    epoch_times.append(time.time() - epoch_start_time)

total_training_time = time.time() - training_start_time

# Save of final configuration
model_filename = os.path.join(config.MODEL_DIR, f'final_model_{datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}.pth')
torch.save(model.state_dict(), model_filename)

config_filename = os.path.join(config.MODEL_DIR, f'config_{datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}.json')
config_data = {
    'BATCH_SIZE': config.BATCH_SIZE,
    'LEARNING_RATE': config.LEARNING_RATE,
    'EPOCHS': config.EPOCHS,
    'DEVICE': config.DEVICE,
    'TRAIN_DIR': config.TRAIN_DIR,
    'VAL_DIR': config.VAL_DIR,
    'TOP5_VAL_ACC': top5_accuracy_list,
    'TRAIN_ACC': train_accuracy_list,
    'VAL_ACC': accuracy_list,
    'BEST_VAL_ACC': max(accuracy_list),
    'BEST_TOP5_ACC': max(top5_accuracy_list),
    'TEST_DIR': config.TEST_DIR,
    'CHECKPOINT_PATH': config.CHECKPOINT_PATH,
    'RESUME_TRAINING': config.RESUME_TRAINING,
    'LAST_EPOCH': config.LAST_EPOCH,
    'NUM_WORKERS': config.NUM_WORKERS,
    'WEIGHT_DECAY': config.WEIGHT_DECAY,
    'TOTAL_TRAINING_TIME': total_training_time,
    'EPOCH_TIMES': epoch_times,
    'TRAIN_ACCURACY': train_accuracy_list,
    'VAL_ACCURACY': accuracy_list,
    'NUM_CLASSES': len(selected_classes),
    'CLASSES': selected_classes
}
with open(config_filename, 'w') as f:
    json.dump(config_data, f, indent=4)
print(f"Models saved as: {model_filename}")
plot_training_progress(train_accuracy_list, accuracy_list, top5_accuracy_list, config.MODEL_DIR)
print(f"Configuration saved as: {config_filename}")
