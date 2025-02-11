import type {Plant, PlantplantIdSensors} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantPatchBody
 */
export interface PlantPatchBody extends Omit<Plant, 'plantId'> {
  /**
   * @type {Array<PlantplantIdSensors>}
   * @memberof PlantPatchBody
   */
  sensors?: Array<PlantplantIdSensors>

  /**
   * Liste von Geräten, die vollständig zugewiesen werden. Alle angeschlossenen Sensoren werden der Pflanze zugeordnet.
   *
   * @type {Array<string>}
   * @memberof PlantPatchBody
   */
  assignFullDevice?: Array<string>
}
