import base64
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from .main import MAX_IMAGE_SIZE
from .main import app

client = TestClient(app)


def generate_base64_image(image_filename="test_img.jpg"):
    """
    Reads an existing image from the same folder as this script,
    encodes it in Base64 format, and returns it as a string.

    Args:
        image_filename (str): Name of the image file to encode.

    Returns:
        str: Base64-encoded string of the image in JPEG format.
    """
    script_dir = Path(__file__).resolve().parent
    image_path = script_dir / image_filename

    if not image_path.exists():
        raise FileNotFoundError(f"The image '{image_filename}' was not found in the folder.")

    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode("utf-8")

    return f"data:image/jpeg;base64,{base64_image}"


def test_hello_world():
    """
    Tests the root endpoint ("/") and verifies that the expected
    "Hello World 🌍" message is returned.

    Assertions:
        - The HTTP status code must be 200.
        - The JSON response must contain the expected message.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World 🌍"}


@patch("api.main.run_plant_classifier")
@patch("api.main.run_plant_getter")
def test_classify_plant_valid_image(mock_getter, mock_classifier):
    """
    Tests the "/uploads" endpoint with a valid Base64 image.

    Assertions:
        - The HTTP status code must be 200.
        - The JSON response must contain the key "results".
    """
    valid_base64_image = generate_base64_image()

    mock_classifier.return_value = [
        {"plant_name": "Rosa indica", "probability": 98.2},
        {"plant_name": "Lavandula", "probability": 84.7}
    ]

    mock_getter.return_value = [
        {
            "plant": {"scientific_name": "Rosa indica", "family": "Rosaceae"},
            "wikipedia": "https://de.wikipedia.org/wiki/Rosa_indica"
        },
        {
            "plant": {"scientific_name": "Lavandula", "family": "Lamiaceae"},
            "wikipedia": "https://de.wikipedia.org/wiki/Lavendel"
        }
    ]

    response = client.post("/uploads", json={"images": [valid_base64_image]})
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert len(result["recognitions"]) == 2
    assert result["recognitions"][0]["name"] == "Rosa indica"


@patch("api.main.run_plant_classifier")
@patch("api.main.run_plant_getter")
def test_classify_plant_multiple_images(mock_getter, mock_classifier):
    """
    Tests the "/uploads" endpoint with multiple Base64 images.

    Assertions:
        - The HTTP status code must be 200.
        - The JSON response must contain predictions for each uploaded image.
    """
    valid_base64_image1 = generate_base64_image()
    valid_base64_image2 = generate_base64_image()

    mock_classifier.side_effect = [
        [
            {"plant_name": "Rosa indica", "probability": 90.0},
            {"plant_name": "Lavandula", "probability": 85.0},
        ],
        [
            {"plant_name": "Tulipa gesneriana", "probability": 91.0},
            {"plant_name": "Hyacinthus", "probability": 80.0},
        ]
    ]

    mock_getter.side_effect = [
        [
            {
                "plant": {"scientific_name": "Rosa indica", "family": "Rosaceae"},
                "wikipedia": "https://de.wikipedia.org/wiki/Rosa_indica"
            },
            {
                "plant": {"scientific_name": "Lavandula", "family": "Lamiaceae"},
                "wikipedia": "https://de.wikipedia.org/wiki/Lavendel"
            }
        ],
        [
            {
                "plant": {"scientific_name": "Tulipa gesneriana", "family": "Liliaceae"},
                "wikipedia": "https://de.wikipedia.org/wiki/Tulpe"
            },
            {
                "plant": {"scientific_name": "Hyacinthus orientalis", "family": "Asparagaceae"},
                "wikipedia": "https://de.wikipedia.org/wiki/Hyazinthe"
            }
        ]
    ]

    response = client.post("/uploads", json={"images": [valid_base64_image1, valid_base64_image2]})
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 2
    assert len(results[0]["recognitions"]) == 2
    assert len(results[1]["recognitions"]) == 2


def test_classify_plant_invalid_image():
    """
    Tests the "/uploads" endpoint with an invalid Base64 string.

    Assertions:
       - The HTTP status code must be 400.
       - The JSON response must contain the error "Invalid Base64 format.".
    """
    invalid_base64_image = "data:image/jpeg;base64,invalid-}base64"

    response = client.post(
        "/uploads", json={"images": [invalid_base64_image]}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Base64 format."


def test_image_too_large():
    """
    Tests the "/uploads" endpoint with an oversized image.

    Assertions:
        - The HTTP status code must be 413.
        - The JSON response must contain the appropriate error message indicating size limit exceeded.
    """
    large_base64_image = "data:image/jpeg;base64," + "A" * (MAX_IMAGE_SIZE + 1)

    response = client.post(
        "/uploads", json={"images": [large_base64_image]}
    )
    assert response.status_code == 413
    assert response.json()["detail"] == "The image exceeds the maximum file size of 5 MB."


def test_classify_plant_empty_image_list():
    """
    Tests the "/uploads" endpoint with an empty image list.

    Assertions:
        - The HTTP status code must be 400.
        - The JSON response must contain the appropriate error message for missing images.
    """
    response = client.post(
        "/uploads", json={}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing image data."


def test_search_plant_missing_name():
    """
    Tests the "/search" endpoint with missing 'name' field in the request.

    Assertions:
        - The HTTP status code must be 400.
        - The JSON response must contain the error message "Missing plant name."
    """
    response = client.post(
        "/search", json={}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing plant name."


@patch("api.main.run_plant_getter")
def test_search_plant_valid_name(mock_getter):
    """
    Tests the "/search" endpoint with a valid plant name.

    Assertions:
        - The HTTP status code must be 200.
        - The JSON response must contain the 'results' key.
        - The 'results' should contain the plant data and its associated Wikipedia link.
    """
    mock_getter.return_value = [
        {
            "name": "Rosa indica",
            "plant": {"scientific_name": "Rosa indica", "family": "Rosaceae"},
            "wikipedia": "https://en.wikipedia.org/wiki/Rosa_indica"
        }
    ]

    response = client.post(
        "/search", json={"name": "Rosa indica"}
    )
    assert response.status_code == 200
    assert "results" in response.json()
    assert len(response.json()["results"]) == 1
    assert response.json()["results"][0]["name"] == "Rosa indica"
    assert "wikipedia" in response.json()["results"][0]
    assert response.json()["results"][0]["wikipedia"] == "https://en.wikipedia.org/wiki/Rosa_indica"
