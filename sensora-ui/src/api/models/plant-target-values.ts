/**
 *
 *
 * @export
 * @interface PlantTargetValues
 */
export interface PlantTargetValues {
  /**
   * Zielwert
   *
   * @type {number}
   * @memberof PlantTargetValues
   * @example 33.4
   */
  value: number

  /**
   * Art des Zielwerts
   *
   * @type {string}
   * @memberof PlantTargetValues
   * @example temperature
   */
  ilk: ilk
}

export enum ilk {
  temperature = 'temperature',
  soilMoisture = 'soilMoisture',
  brightness = 'brightness',
  humidity = 'humidity',
}
