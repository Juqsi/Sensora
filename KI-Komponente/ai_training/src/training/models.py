import torch
import torch.nn as nn


class MyModel(nn.Module):
    """
    Convolutional Neural Network (CNN) for image classification.

    This model consists of several convolutional blocks with batch normalization,
    ReLU activation, dropout, and pooling layers. The extracted features are then
    passed through fully connected layers to perform the final classification.

    Args:
        num_classes (int): Number of output classes for classification. Default is 15.
    """

    def __init__(self, num_classes=15):
        """
        Initializes the MyModel and defines the network architecture.

        Creates the convolutional, batch normalization, dropout, pooling, and
        fully connected layers of the network.

        Args:
            num_classes (int): Number of output classes. Default is 15.
        """
        super(MyModel, self).__init__()

        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(64)
        self.dropout1 = nn.Dropout(0.05)  # Lower dropout in early CNN layers

        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(128)
        self.dropout2 = nn.Dropout(0.1)

        self.conv3 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(256)
        self.dropout3 = nn.Dropout(0.2)

        self.conv4 = nn.Conv2d(256, 512, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(512)
        self.dropout4 = nn.Dropout(0.4)

        self.pool = nn.MaxPool2d(2, 2)
        self.adaptive_pool = nn.AdaptiveAvgPool2d((1, 1))

        self.fc1 = nn.Linear(512, 1024)
        self.dropout_fc = nn.Dropout(0.6)  # Higher dropout value in the FC layer
        self.fc2 = nn.Linear(1024, num_classes)

    def forward(self, x):
        """
        Performs a forward pass of the model.

        Processes the input through a sequence of convolutional blocks,
        each consisting of convolution, batch normalization, ReLU, pooling,
        and dropout. Then applies adaptive pooling to reduce the feature vector
        and passes it through fully connected layers for the final classification.

        Args:
            x (torch.Tensor): Input tensor with shape (N, C, H, W), where N is the batch size.

        Returns:
            torch.Tensor: Network output (logits) for each class.
        """
        x = self.pool(torch.relu(self.bn1(self.conv1(x))))
        x = self.dropout1(x)  # Dropout after the first block

        x = self.pool(torch.relu(self.bn2(self.conv2(x))))
        x = self.dropout2(x)

        x = self.pool(torch.relu(self.bn3(self.conv3(x))))
        x = self.dropout3(x)

        x = self.pool(torch.relu(self.bn4(self.conv4(x))))
        x = self.dropout4(x)

        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)

        x = torch.relu(self.fc1(x))
        x = self.dropout_fc(x)  # Dropout before the final layer
        x = self.fc2(x)

        return x
