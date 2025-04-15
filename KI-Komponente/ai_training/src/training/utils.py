import torch


def save_checkpoint(model, optimizer, epoch, checkpoint_path):
    """
    Saves the current state of the model and optimizer as a checkpoint.

    This function stores the state of the model, optimizer, and the current epoch
    in a dictionary and writes this dictionary to a file specified by 'checkpoint_path'.

    Args:
        model (torch.nn.Module): The model to be saved.
        optimizer (torch.optim.Optimizer): The optimizer whose state will also be saved.
        epoch (int): The current epoch to record in the checkpoint.
        checkpoint_path (str): The file path where the checkpoint will be saved.

    Returns:
        None

    Side Effects:
        - Saves a checkpoint on the disk.
        - Prints a confirmation message to the console.
    """
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
    }
    torch.save(checkpoint, checkpoint_path)
    print(f"Checkpoint saved for epoch {epoch}.")


def load_checkpoint(model, optimizer, path, device):
    """
    Loads a saved checkpoint and restores the state of the model and optimizer.

    This function loads a checkpoint from the specified path, restores the model
    and optimizer state, and returns the loaded epoch.

    Args:
        model (torch.nn.Module): The model into which the saved state will be loaded.
        optimizer (torch.optim.Optimizer): The optimizer into which the saved state will be loaded.
        path (str): The path to the checkpoint file.
        device (torch.device or str): The device on which the loaded data should be mapped.

    Returns:
        tuple: A tuple (model, optimizer, epoch) containing the model with loaded state,
               the optimizer with loaded state, and the last saved epoch.

    Side Effects:
        - Prints status messages to the console.
    """
    print(f"Loading checkpoint from {path}...")
    checkpoint = torch.load(path, map_location=device, weights_only=True)  # Safer loading
    model.load_state_dict(checkpoint['model_state_dict'])
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    epoch = checkpoint['epoch']
    print(f"Checkpoint loaded (Epoch {epoch})")
    return model, optimizer, epoch