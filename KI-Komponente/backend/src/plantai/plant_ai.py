"""
This Module offers a class for classifying Plant Images by species of plant.
"""
import torch
import torchvision.transforms as transforms
from pathlib import Path
from torchvision import models
from PIL import Image
import json


class PlantClassifier:
    """
    This CLass simplifies recognition into one callable function.
    """

    def __init__(self):
        """
        Initializes the PlantClassifier class by setting up the ai model.
        """
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        content_root = Path(__file__).resolve().parent
        model_path = content_root / "ki" / "finetuned_model_2025-03-27_09-38-24.pth"
        config_path = content_root / "ki" / "config_finetune_2025-03-27_09-38-24.json"
        class_map_path = content_root / "ki" / "plantnet300K_species_names.json"

        # Klassen laden
        with open(config_path, 'r') as f:
            config: dict = json.load(f)
        self.class_ids = config["CLASSES"]

        # Mapping von ID → Klarname laden
        with open(class_map_path, 'r') as f:
            self.class_map: dict = json.load(f)

        # Modelsetup
        self.model = models.resnet50()
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, len(self.class_ids))
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        # Transforms wie beim training
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

    def __make_prediction(self, image_path: str, top_k: int) -> tuple:
        """
        Analyzes one Image and returns the given number of classification descending by likeliness.

        Args:
            image_path: the path where the image is saved
            top_k: how many answers should be returned
        Returns
            top_probs, top_indices: containing classifications by index in the config and respectivelikeliness of each
        """
        try:
            image = Image.open(image_path).convert('RGB')
        except FileNotFoundError:
            raise FileNotFoundError(f"File {image_path} not found")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)  # Wahrscheinlichkeiten berechnen
            top_probs, top_indices = torch.topk(probabilities, top_k, dim=1)  # Top-k Werte extrahieren

        return top_probs, top_indices

    def __get_prediction_k(self, image_path: str, k: int) -> dict:
        """
        Analyzes one Image and returns k likeliest classification.

        Args:
            image_path: the path where the image is saved
            k: wich index the result should have, when ordered by likeliness
        Returns
            prediction_k: the k likeliest classification of the Image
        """
        top_probs, top_indices = self.__make_prediction(image_path, k)
        class_id = self.class_ids[top_indices[0, k - 1].item()]
        human_readable = self.class_map.get(class_id, "Unbekannt")
        prob = top_probs[0, k - 1].item()  # Wahrscheinlichkeit als Float
        prediction_k = {
            "class_id": class_id,
            "plant_name": human_readable,
            "probability": round(prob * 100, 2)
        }
        return prediction_k

    def predict_from_image_path(self, image_path: str, num_of_results: int):
        """
        Analyzes one Image and returns the given number of Answers descending by likeliness.

        Args:
            image_path: the path where the image is saved
            num_of_results: how many classifications should be returned excluding duplicate classes
        Returns
            predictions: list of length num_of_results conaining the classifications by id, name and their likeliness
        """
        try:
            predictions: list = []
            if num_of_results > 20:
                num_of_results = 20
            top_k = num_of_results
            top_probs, top_indices = self.__make_prediction(image_path, top_k)
            for i in range(top_k):
                class_id = self.class_ids[top_indices[0, i].item()]
                human_readable = self.class_map.get(class_id, "Unbekannt")
                prob: float = top_probs[0, i].item()  # Wahrscheinlichkeit als Float
                new_prediction: bool = True
                # ensure no plant is accidentally spread over two classes
                for prediction in predictions:
                    if prediction["plant_name"] == human_readable:
                        prediction["probability"] += round(prob * 100, 2)
                        new_prediction = False
                        break

                if new_prediction:
                    predictions.append({
                        "class_id": class_id,
                        "plant_name": human_readable,
                        "probability": round(prob * 100, 2)
                    })
            # get more classifications in case of doubles occouring to reach desired number of unique classifications
            doubles: int = 0
            while num_of_results > len(predictions):
                predictions.append(self.__get_prediction_k(image_path, num_of_results + doubles + 1))
                doubles += 1
            return predictions

        except FileNotFoundError:
            return f"error: File {image_path} not found"
