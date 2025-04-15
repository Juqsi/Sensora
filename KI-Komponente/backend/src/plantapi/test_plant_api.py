from unittest.mock import patch

import pytest

from .plant_api import PlantGetter, _PlantApi, _WikiApi  # Adjust the import to match your module name


def test_get_plant_data_success():
    """
    Tests _PlantApi.get_plant_data with a valid plant name and a mocked API response.
    """
    mock_response = [{"scientific_name": "Rosa indica", "family": "Rosaceae"}]
    with patch.object(_PlantApi, 'get_plant_data', return_value=mock_response):
        with _PlantApi() as plant_api:
            response = plant_api.get_plant_data("Rosa indica")

    assert response == mock_response


def test_get_plant_data_failure():
    """
    Tests _PlantApi.get_plant_data with a mocked API failure.
    """
    with patch.object(_PlantApi, 'get_plant_data', side_effect=ValueError("Invalid input")):
        with pytest.raises(ValueError, match="Invalid input"):
            with _PlantApi() as plant_api:
                plant_api.get_plant_data(123)  # Invalid input


def test_get_wikipedia_link_success():
    """
    Tests _WikiApi.get_wikipedia_link with a valid plant name and a mocked Wikipedia response.
    """
    mock_url = "https://de.wikipedia.org/wiki/Rosa_indica"
    with patch.object(_WikiApi, 'get_wikipedia_link', return_value=mock_url):
        with _WikiApi() as wiki_api:
            response = wiki_api.get_wikipedia_link("Rosa_indica")

    assert response == mock_url


def test_get_wikipedia_link_failure():
    """
    Tests _WikiApi.get_wikipedia_link when no article exists.
    """
    with patch.object(_WikiApi, 'get_wikipedia_link', return_value=None):
        with _WikiApi() as wiki_api:
            response = wiki_api.get_wikipedia_link("Unknown_Plant")

    assert response is None


def test_get_plant_list_data_success():
    """
    Tests PlantGetter.get_plant_list_data with multiple plant names and mocked API/Wikipedia responses.
    """
    plant_names = ["Rosa indica", "Tulipa gesneriana"]
    mock_plant_responses = [
        [{"scientific_name": "Rosa indica", "family": "Rosaceae"}],
        [{"scientific_name": "Tulipa gesneriana", "family": "Liliaceae"}]
    ]
    mock_wiki_responses = [
        "https://de.wikipedia.org/wiki/Rosa_indica",
        "https://de.wikipedia.org/wiki/Tulipa_gesneriana"
    ]

    with patch.object(_PlantApi, 'get_plant_data', side_effect=mock_plant_responses), \
            patch.object(_WikiApi, 'get_wikipedia_link', side_effect=mock_wiki_responses):
        results = PlantGetter.get_plant_list_data(plant_names)

    assert results == [
        {
            "name": "Rosa indica",
            "plant": {"scientific_name": "Rosa indica", "family": "Rosaceae"},
            "wikipedia": "https://de.wikipedia.org/wiki/Rosa_indica"
        },
        {
            "name": "Tulipa gesneriana",
            "plant": {"scientific_name": "Tulipa gesneriana", "family": "Liliaceae"},
            "wikipedia": "https://de.wikipedia.org/wiki/Tulipa_gesneriana"
        }
    ]
