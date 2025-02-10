import type {Plant, User} from '@/api'

/**
 *
 *
 * @export
 * @interface Room
 */
export interface Room {
  /**
   * Die Gruppe, der der Raum zugeordnet ist. Kann leer sein.
   *
   * @type {string}
   * @memberof Room
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  groupId?: string

  /**
   * @type {string}
   * @memberof Room
   * @example Neuer Raum
   */
  name?: string

  /**
   * Eindeutige ID des Raums, unveränderlich
   *
   * @type {string}
   * @memberof Room
   * @example 55197b05-56e7-4923-acb5-3cc1f1ea1fe5
   */
  rid?: string

  /**
   * Der Besitzer des Raums.
   *
   * @type {User}
   * @memberof Room
   */
  owner?: User

  /**
   * Liste der zugeordneten Pflanzen
   *
   * @type {Array<Plant>}
   * @memberof Room
   */
  plants?: Array<Plant>
}
