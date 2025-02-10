import type {Plant} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantBody
 */
export interface PlantBody extends Plant {
  /**
   * @type {any}
   * @memberof PlantBody
   */
  plantId?: any

  /**
   * @type {any}
   * @memberof PlantBody
   */
  controllers?: any

  /**
   * @type {Array<any>}
   * @memberof PlantBody
   */
  targetValues?: Array<any>
}
