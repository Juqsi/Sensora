import base64
import binascii
import os
import uuid
from io import BytesIO

from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware

from plantai.plant_ai import PlantClassifier
from plantapi.plant_api import PlantGetter

# Create image upload folder
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "classify")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load maximum image size from .env file (default: 5 MB)
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "5242880"))

# Load Host domain
HOST = os.getenv("HOST", "")
MIN_ACC = float(os.getenv("MIN_ACC", "40"))
app = FastAPI()

origins = [
    "https://localhost",
    HOST
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = PlantClassifier()
getter = PlantGetter()


def decode_and_save_image(image_base64: str) -> str:
    """
    Decodes a Base64-encoded image and saves it as a JPG file in the upload folder.

    Args:
        image_base64 (str): The Base64-encoded image string (can include data URL prefix).

    Returns:
        str: The absolute file path of the saved JPG image.

    Raises:
        HTTPException (413): If the image size exceeds the configured limit.
        HTTPException (400): If the Base64 format is invalid or the image format is unsupported.
        HTTPException (500): If an unknown error occurs during processing.
    """
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]

    if len(image_base64) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413, detail="The image exceeds the maximum file size of 5 MB."
        )

    try:
        image_data = base64.b64decode(image_base64)

    except binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid Base64 format.")

    try:
        image = Image.open(BytesIO(image_data))
        unique_filename = f"{uuid.uuid4().hex}.jpg"
        save_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        image.convert("RGB").save(save_path, "JPEG")

        return save_path

    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="The image format is not supported.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unknown error: {str(e)}")


def run_plant_classifier(image_path: str) -> list:
    """
    Executes the plant classifier model using the provided image path.

    Args:
        image_path (str): The absolute path to the saved image file.

    Returns:
        list: A list of predicted plant classifications, each containing plant details and probabilities.

    Raises:
        HTTPException (500): If an error occurs during model prediction.
    """
    try:
        predictions = classifier.predict_from_image_path(image_path, num_of_results=5)

        return predictions

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI script: {e}")


def run_plant_getter(plant_names: list) -> list:
    """
    Fetches detailed plant information for the given list of plant names.

    Args:
        plant_names (list): A list of plant names obtained from the classifier.

    Returns:
        list: A list containing detailed plant information, including Wikipedia links.

    Raises:
        HTTPException (500): If an error occurs while fetching the plant data.
    """
    try:
        return getter.get_plant_list_data(plant_names)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching plant data: {e}")


@app.post("/uploads")
async def classify_plant(image_data: dict):
    """
    Endpoint for classifying multiple Base64-encoded images of plants.

    Args:
        image_data (dict): JSON data containing a list of Base64-encoded image strings.

    Returns:
        dict: A dictionary containing results for each processed image, including recognized plant names,
              additional data, and probabilities.

    Raises:
        HTTPException (400): If the 'images' field is missing in the request.
        HTTPException (500): For unexpected errors in processing or classification.

    Example request:

    .. code-block:: json

        {
            "images": [
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAP8A/wD/...",
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAP8A/wD/..."
            ]
        }

    Example response:

    .. code-block:: json

        {
            "results": [
                {
                    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAP8A/wD/...",
                    "recognitions": [
                        {
                            "name": "Rosa indica",
                            "plant": { ... },
                            "wikipedia": "https://en.wikipedia.org/wiki/Rosa_indica",
                            "probability": 0.98
                        },
                        {
                            "name": "Rosa rugosa",
                            "plant": { ... },
                            "wikipedia": "https://en.wikipedia.org/wiki/Rosa_rugosa",
                            "probability": 0.85
                        }
                    ]
                }
            ]
        }
    """
    if "images" not in image_data:
        raise HTTPException(status_code=400, detail="Missing image data.")

    results = []
    for image_base64 in image_data["images"]:
        image_path = decode_and_save_image(image_base64)

        try:
            predictions = run_plant_classifier(image_path)
            predictions = [prediction for prediction in predictions if prediction["probability"] >= MIN_ACC]
            plant_names = [prediction["plant_name"] for prediction in predictions]
            plant_info = run_plant_getter(plant_names)

            image_results = {
                "image": image_base64,
                "recognitions": []
            }

            for i, prediction in enumerate(predictions):
                plant_name = prediction["plant_name"]
                plant_data = plant_info[i] if i < len(plant_info) else None

                recognition = {
                    "name": plant_name,
                    "plant": plant_data["plant"] if plant_data else None,
                    "wikipedia": plant_data["wikipedia"] if plant_data else None,
                    "probability": prediction["probability"]
                }
                image_results["recognitions"].append(recognition)

            results.append(image_results)

        finally:
            if os.path.exists(image_path):
                os.remove(image_path)

    return {"results": results}


@app.post("/search")
async def search_plant(plant_data: dict):
    """
    Endpoint for searching plants by their names and retrieving additional data.

    Args:
        plant_data (dict): A dictionary containing the plant name(s) under the "name" key.
            The "name" key can contain a single plant name (string) or a list of plant names.

    Returns:
        dict: A dictionary containing the results of the search with additional plant information.
            The results include the plant name, its associated data, and a link to the Wikipedia page.

    Raises:
        HTTPException (400): If the 'name' field is missing in the request or if it's an invalid input.

    Example request:

    .. code-block:: json

        {
            "name": "Rosa indica"
        }

    Example response:

    .. code-block:: json

        {
            "results": [
                {
                    "name": "Rosa indica",
                    "plant": { ... },
                    "wikipedia": "https://en.wikipedia.org/wiki/Rosa_indica"
                }
            ]
        }
    """
    if "name" not in plant_data:
        raise HTTPException(status_code=400, detail="Missing plant name.")

    plant_names = plant_data["name"] if isinstance(plant_data["name"], list) else [plant_data["name"]]
    results = run_plant_getter(plant_names)

    return {"results": results}


@app.get("/")
async def hello_world():
    """
    A simple endpoint to verify that the API is online.

    Returns:
        dict: A greeting message confirming the API is active.
    """
    return {"message": "Hello World 🌍"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
