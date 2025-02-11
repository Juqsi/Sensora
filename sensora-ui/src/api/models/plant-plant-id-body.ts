import type {Plant, PlantplantIdSensors} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantPlantIdBody
 */
export interface PlantPlantIdBody extends Omit<Plant, 'plantId'> {
  /**
   * @type {any}
   * @memberof PlantPlantIdBody
   */
  plantId?: string

  /**
   * @type {Array<PlantplantIdSensors>}
   * @memberof PlantPlantIdBody
   */
  sensors?: Array<PlantplantIdSensors>

  /**
   * Liste von Geräten, die vollständig zugewiesen werden. Alle angeschlossenen Sensoren werden der Pflanze zugeordnet.
   *
   * @type {Array<string>}
   * @memberof PlantPlantIdBody
   */
  assignFullDevice?: Array<string>
}
