import type { Plant, Sensor } from '@/api'

/**
 *
 *
 * @export
 * @interface updatePlantBody
 */
export interface updatePlantBody extends Omit<Plant, 'plantId' | 'controllers'> {
  /**
   * @type {Array<PlantplantIdSensors>}
   * @memberof updatePlantBody
   */
  sensors?: Array<Sensor>

  /**
   * Liste von Geräten, die vollständig zugewiesen werden. Alle angeschlossenen Sensoren werden der Pflanze zugeordnet.
   *
   * @type {Array<string>}
   * @memberof updatePlantBody
   */
  assignFullDevice?: Array<string>
}
