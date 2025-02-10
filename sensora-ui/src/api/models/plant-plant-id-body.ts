import type {Plant, PlantplantIdSensors} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantPlantIdBody
 */
export interface PlantPlantIdBody extends Plant {
  /**
   * @type {any}
   * @memberof PlantPlantIdBody
   */
  plantId?: any

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

  /**
   * @type {Array<any>}
   * @memberof PlantPlantIdBody
   */
  targetValues?: Array<any>
}
