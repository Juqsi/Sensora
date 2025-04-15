import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay


def save_confusion_matrix(model, val_loader, selected_classes, device, epoch, output_dir):
    """
    Saves the normalized confusion matrix as PNG and CSV files and prints the most common misclassifications.

    This function performs the following steps:
      1. Computes model predictions on the validation dataset.
      2. Generates a normalized confusion matrix.
      3. Visualizes the matrix using Matplotlib and saves the plot as a PNG file.
      4. Saves the normalized matrix as a CSV file.
      5. Identifies and prints the top-N (default 30) most frequent misclassifications (excluding diagonal entries).

    Args:
        model (torch.nn.Module): The model to be evaluated.
        val_loader (torch.utils.data.DataLoader): DataLoader for the validation dataset.
        selected_classes (list): List of class names.
        device (torch.device or str): Device on which calculations are performed (e.g., "cpu" or "cuda").
        epoch (int): Current epoch for labeling saved files.
        output_dir (str): Directory where the image and CSV files will be saved.

    Returns:
        None
    """
    all_labels = []
    all_preds = []

    model.eval()
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs, 1)
            all_labels.extend(labels.cpu().numpy())
            all_preds.extend(predicted.cpu().numpy())

    cm = confusion_matrix(all_labels, all_preds)
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

    # Create and save the confusion matrix visualization
    fig, ax = plt.subplots(figsize=(12, 10))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm_normalized, display_labels=selected_classes)
    disp.plot(ax=ax, cmap='Blues', xticks_rotation=90, values_format=".2f")
    plt.title(f"Normalized Confusion Matrix (Epoch {epoch})")
    plt.tight_layout()

    os.makedirs(output_dir, exist_ok=True)
    plt.savefig(os.path.join(output_dir, f"confusion_matrix_epoch_{epoch}.png"))

    # Save the normalized confusion matrix as a CSV file
    df_cm = pd.DataFrame(cm_normalized, index=selected_classes, columns=selected_classes)
    df_cm.to_csv(os.path.join(output_dir, f"confusion_matrix_normalized_epoch_{epoch}.csv"))

    # Identify top-N most frequent misclassifications (excluding diagonal)
    N = 30  # Number of top errors
    error_matrix = cm_normalized.copy()
    np.fill_diagonal(error_matrix, 0)  # Ignore diagonal = correct predictions
    flat_indices = np.argsort(error_matrix.ravel())[::-1][:N]  # Top-N errors
    top_misclassifications = [np.unravel_index(idx, error_matrix.shape) for idx in flat_indices]

    print(f"\nTop-{N} most frequent misclassifications in Epoch {epoch}:")
    for i, j in top_misclassifications:
        true_label = selected_classes[i]
        predicted_label = selected_classes[j]
        confusion_value = error_matrix[i, j]
        print(f"  {true_label} → {predicted_label}: {confusion_value:.2f}")

    # Close the plot
    plt.close()


def plot_training_progress(train_acc, val_acc, top5_acc, output_dir):
    """
    Plots and saves the training and validation accuracy progress over epochs.

    This function creates a plot that displays training accuracy, validation accuracy (Top-1),
    and validation accuracy (Top-5) over epochs. The resulting plot is saved as a PNG file
    in the specified output directory.

    Args:
        train_acc (list): List of training accuracies per epoch.
        val_acc (list): List of validation accuracies (Top-1) per epoch.
        top5_acc (list): List of validation accuracies (Top-5) per epoch.
        output_dir (str): Directory where the plot should be saved.

    Returns:
        None
    """
    os.makedirs(output_dir, exist_ok=True)
    epochs = range(1, len(train_acc) + 1)

    plt.figure(figsize=(10, 6))
    plt.plot(epochs, train_acc, label='Train Accuracy')
    plt.plot(epochs, val_acc, label='Validation Accuracy (Top-1)')
    plt.plot(epochs, top5_acc, label='Validation Accuracy (Top-5)')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.title('Training & Validation Accuracy')
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(output_dir, "training_accuracy_plot.png"))
    plt.close()
