import type {Controller, PlantTargetValues} from '@/api'

/**
 *
 *
 * @export
 * @interface Plant
 */
export interface Plant {
  /**
   * Eindeutige ID der Pfalnze, unveränderlich
   *
   * @type {string}
   * @memberof Plant
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  plantId?: string

  /**
   * @type {string}
   * @memberof Plant
   * @example Tomatenpflanze
   */
  name?: string

  /**
   * ID des Raumes, dem die Pflanze zugeordnet ist
   *
   * @type {string}
   * @memberof Plant
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  room?: string

  /**
   * @type {string}
   * @memberof Plant
   * @example Tomate
   */
  plantType?: string

  /**
   * @type {string}
   * @memberof Plant
   * @example Meine beste Pflanze
   */
  note?: string

  /**
   * @type {string}
   * @memberof Plant
   * @example 7aa91e15-ba7f-4afb-8b56-f1f8c15642c6
   */
  avatarId?: string

  /**
   * Liste der Sensoren, die dieser Pflanze zugeordnet sind.
   *
   * @type {Array<Controller>}
   * @memberof Plant
   */
  controllers?: Array<Controller>

  /**
   * @type {Array<PlantTargetValues>}
   * @memberof Plant
   */
  targetValues?: Array<PlantTargetValues>
}
