"""
This module implements the PlantGetter class which can be used for getting additional Data for a list of plants.
"""
import os

from dotenv import load_dotenv
from requests import Session
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


class _PlantApi:
    """
    This Class simplifies API calls to a Plant API into one function.
    """

    def __init__(self):
        """
        Initializes a new Instance of  the PlantApi class and creates a session object.
        """
        load_dotenv()
        self.api_key = os.getenv("PLANT_API_KEY")
        self.session = Session()
        self.session.headers.update(Authorization=self.api_key)
        retries = Retry(
            total=3,
            backoff_factor=0.1,
            status_forcelist=[502, 503, 504],
            allowed_methods={'GET'},
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        self.plant_base_url = 'https://ASE.Juqsi.de/plants/search?name='

    def __enter__(self):
        """
        Enter function to support context managers

        Returns
            self: the PlantApi instance
        """
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Exit function to support context managers

        Args:
            exc_type: The type of the exit happening
            exc_val: The value of the exit happening
            exc_tb: The traceback of the exit happening
        """
        self.session.close()

    def get_plant_data(self, name: str) -> list:
        """
        Makes one API call to get additional data to the plant identified by the given scientific name.

        Args:
            name: scientific name of the plant
        Returns
            plant_data: additional data about the given plant
        """
        try:
            url: str = self.plant_base_url + name
            plant_data = self.session.get(url, timeout=3.05).json()
            return plant_data

        except ValueError as value_error:
            raise ValueError(f'{value_error} Input was not a List of Strings')


class _WikiApi:
    def __init__(self):
        """
        Initializes a new Instance of  the WikiApi Class and initializes a session object.
        """

        self.session = Session()
        retries = Retry(
            total=3,
            backoff_factor=0.1,
            status_forcelist=[502, 503, 504],
            allowed_methods={'GET'},
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        self.wiki_base_url = 'https://de.wikipedia.org/api/rest_v1/page/summary/'

    def __enter__(self):
        """
        Enter function to support context managers

        Returns
            self: the WikiApi instance
        """
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Exit function to support context managers

        Args:
            exc_type: The type of the exit happening
            exc_val: The value of the exit happening
            exc_tb: The traceback of the exit happening
        """
        self.session.close()

    def get_wikipedia_link(self, plant_name):
        url = self.wiki_base_url + plant_name
        response = self.session.get(url, timeout=3.05)

        if response.status_code == 200:
            data = response.json()
            if "content_urls" in data and "desktop" in data["content_urls"]:
                return data["content_urls"]["desktop"]["page"]

        return None


class PlantGetter:

    @staticmethod
    def get_plant_list_data(plant_name_list: list[str]):
        """
        Fetches additional data for each given plant by making API calls via a helper class.

        Args:
            plant_name_list: list of scientific names of the plant

        Returns
            result: list of all given plants with their additional data
        """
        data_list: list = []
        with _PlantApi() as Plant_api:
            with _WikiApi() as wiki_api:
                for plant_name in plant_name_list:
                    response: list = Plant_api.get_plant_data(plant_name)
                    data = {
                        "name": plant_name.replace("_", " "),
                        "plant": None,
                        "wikipedia": wiki_api.get_wikipedia_link(plant_name),
                    }
                    if response:
                        data["plant"] = response[0]
                    data_list.append(data)
            return data_list
