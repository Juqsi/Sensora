import HttpClient from '../utils/HttpClient'
import type { Plant, UpdatePlantModel } from '../models/PlantModel'
import { validatePlant } from '../validation/PlantValidation'

const BASE_URL = '/plants'

export const PlantService = {
  /**
   * Abrufen aller Pflanzen
   * @returns Promise<Plant[]>
   */
  async getAllPlants(): Promise<Plant[]> {
    return HttpClient.get<Plant[]>(BASE_URL)
  },

  /**
   * Abrufen einer Pflanze anhand der ID
   * @param id - ID der Pflanze
   * @returns Promise<Plant>
   */
  async getPlantById(id: string): Promise<Plant> {
    return HttpClient.get<Plant>(`${BASE_URL}/${id}`)
  },

  /**
   * Erstellen einer neuen Pflanze
   * @param plantData - Daten für die neue Pflanze
   * @returns Promise<Plant>
   */
  async createPlant(plantData: UpdatePlantModel): Promise<Plant> {
    try {
      validatePlant(plantData)
      return HttpClient.post<Plant>(BASE_URL, plantData)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten')
    }
  },

  /**
   * Aktualisieren einer bestehenden Pflanze
   * @param id - ID der Pflanze
   * @param plantData - Aktualisierte Daten
   * @returns Promise<Plant>
   */
  async updatePlant(id: string, plantData: UpdatePlantModel): Promise<Plant> {
    try {
      validatePlant(plantData)
      return HttpClient.patch<Plant>(`${BASE_URL}/${id}`, plantData)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten')
    }
  },

  /**
   * Löschen einer Pflanze
   * @param id - ID der Pflanze
   * @returns Promise<void>
   */
  async deletePlant(id: string): Promise<void> {
    try {
      return HttpClient.delete<void>(`${BASE_URL}/${id}`)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Ein unbekannter Fehler ist aufgetreten')
    }
  },
}
