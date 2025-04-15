"""
This script checks the availability and details of the GPU(s) available on the system using PyTorch.

It performs the following tasks:
1. Checks if a GPU is available using `torch.cuda.is_available()`.
2. Prints the number of GPUs found using `torch.cuda.device_count()`.
3. Prints the name of the first GPU (device 0) using `torch.cuda.get_device_name(0)`.

Outputs:
- A message indicating whether a GPU is available.
- The number of GPUs detected.
- The name of the first GPU (if available).

This script is useful for verifying the system's GPU configuration and ensuring that PyTorch is set up to utilize
GPU acceleration for model training or inference.
"""
import torch
print('GPU available:', torch.cuda.is_available())
print(torch.cuda.device_count(), 'GPUs found')
print(torch.cuda.get_device_name(0))