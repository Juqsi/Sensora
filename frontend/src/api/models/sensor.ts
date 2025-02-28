import { type Value } from '@/api'

/**
 *
 *
 * @export
 * @interface Sensor
 */
export interface Sensor {
  /**
   * Eindeutige ID des Sensors, unveränderlich
   *
   * @type {string}
   * @memberof Sensor
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  sid: string

  /**
   * Zeitpunkt, an dem sich der Sensor zuletzt gemeldet hat
   *
   * @type {string}
   * @memberof Sensor
   * @example 2024-12-16T12:00:00Z
   */
  lastCall: string

  /**
   * ID des Controllers, dem der Sensor zugeordnet ist
   *
   * @type {string}
   * @memberof Sensor
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  controller: string

  /**
   * @type {Array<Value>}
   * @memberof Sensor
   */
  values: Array<Value>

  /**
   * Art des Messwerts
   *
   * @type {string}
   * @memberof Sensor
   * @example temperature
   */
  ilk: string

  /**
   * Maßeinheit
   *
   * @type {string}
   * @memberof Sensor
   * @example °C
   */
  unit: string

  /**
   * @type {string}
   * @memberof Sensor
   * @example active
   */
  status: SensorStatusEnum
}

/**
 * @export
 * @enum {string}
 */
export enum SensorStatusEnum {
  Error = 'error',
  Inactive = 'inactive',
  Active = 'active',
  Unknown = 'unknown',
}
