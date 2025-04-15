import pytest
from unittest.mock import patch, MagicMock
import torch
from plantai.plant_ai import PlantClassifier  # Sicherstellen, dass der Import korrekt ist


@pytest.fixture
def mock_classifier():
    """Creates a PlantClassifier instance with mocked methods"""
    with patch("plantai.plant_ai.models.resnet50") as mock_resnet50, \
            patch("plantai.plant_ai.json.load") as mock_json_load:

        # Mock JSON-Daten
        mock_json_load.side_effect = [
            {"CLASSES": ["1001", "1002", "1003"]},
            {"1001": "Rose", "1002": "Lavender", "1003": "Daisy"}
        ]

        # Mock Modell
        mock_model = MagicMock()
        mock_model.return_value = torch.tensor([[0.8, 0.1, 0.1]])  # Dummy-Ausgabe für Softmax
        mock_resnet50.return_value = mock_model

        yield PlantClassifier()


def test_model_initialization(mock_classifier):
    """TEsts if model was initialzied correctly"""
    assert mock_classifier.model is not None
    assert len(mock_classifier.class_ids) == 3
    assert "1001" in mock_classifier.class_ids


@patch("plantai.plant_ai.Image.open", return_value=MagicMock(spec="PIL.Image.Image"))
@patch("plantai.plant_ai.PlantClassifier._PlantClassifier__make_prediction")
def test_predict_from_image_path(mock_make_prediction, mock_image_open, mock_classifier):
    """Tests prediction with mock data"""
    mock_probs = torch.tensor([[0.7, 0.2, 0.1]])  # 70%, 20%, 10%
    mock_indices = torch.tensor([[0, 1, 2]])
    mock_make_prediction.return_value = (mock_probs, mock_indices)

    result = mock_classifier.predict_from_image_path("./ki/img_7.jpg", 2)

    assert len(result) == 2
    assert result[0]["plant_name"] == "Rose"
    assert result[0]["probability"] == 70.0


@patch("plantai.plant_ai.PlantClassifier._PlantClassifier__make_prediction")
def test_handle_duplicate_predictions(mock_make_prediction, mock_classifier):
    """Tests whether duplicate plant classes are joined into one result"""
    mock_probs = torch.tensor([[0.4, 0.2, 0.3, 0.1]])
    mock_indices = torch.tensor([[0, 1, 0, 2]])
    mock_make_prediction.return_value = (mock_probs, mock_indices)

    result = mock_classifier.predict_from_image_path("./ki/img_7.jpg", 3)

    assert len(result) == 3
    assert result[0]["plant_name"] == "Rose"
    assert result[2]["plant_name"] == "Daisy"
    assert result[0]["probability"] == 70.0  # 40% + 30%


@patch("plantai.plant_ai.PlantClassifier._PlantClassifier__make_prediction")
def test_get_prediction_k(mock_make_prediction, mock_classifier):
    """Tests the  __get_prediction_k-Funktion."""
    mock_probs = torch.tensor([[0.6, 0.3, 0.1]])
    mock_indices = torch.tensor([[2, 1, 0]])
    mock_make_prediction.return_value = (mock_probs, mock_indices)

    result = mock_classifier._PlantClassifier__get_prediction_k("./ki/img_7.jpg", 2)
    assert result["plant_name"] == "Lavender"
    assert result["probability"] == 30.0


@patch("plantai.plant_ai.Image.open", side_effect=FileNotFoundError)
def test_invalid_file_handling(mock_image_open, mock_classifier):
    """Tests wether invalide image paths are being caught correctly"""
    result = mock_classifier.predict_from_image_path("non_existent.jpg", 3)
    assert "error" in result
