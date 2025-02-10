import type {Sensor, User} from '@/api'

/**
 *
 *
 * @export
 * @interface Controller
 */
export interface Controller {
  /**
   * Eindeutige ID des Controllers, unveränderlich
   *
   * @type {string}
   * @memberof Controller
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  did?: string

  /**
   * Modellbezeichnung
   *
   * @type {string}
   * @memberof Controller
   * @example FullControll-4-Sensors
   */
  model?: string

  /**
   * @type {Array<Sensor>}
   * @memberof Controller
   */
  sensors?: Array<Sensor>

  /**
   * @type {User}
   * @memberof Controller
   */
  owner?: User
}
