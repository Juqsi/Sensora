import type {Room, User} from '@/api'

/**
 *
 *
 * @export
 * @interface Group
 */
export interface Group {
  /**
   * @type {string}
   * @memberof Group
   * @example Home
   */
  name: string

  /**
   * Eindeutige ID der Gruppe, unveränderlich
   *
   * @type {string}
   * @memberof Group
   * @example 7aa91e15-ba7f-4afb-8b56-f1f8c15642c6
   */
  gid: string

  /**
   * @type {string}
   * @memberof Group
   * @example Peashooter
   */
  avatarRef?: GroupAvatarRefEnum

  /**
   * Liste der Mitglieder
   *
   * @type {Array<User>}
   * @memberof Group
   */
  members?: Array<User>

  /**
   * Liste der zugeordneten Räume
   *
   * @type {Array<Room>}
   * @memberof Group
   */
  rooms?: Array<Room>
}

/**
 * @export
 * @enum {string}
 */
export enum GroupAvatarRefEnum {
  Peashooter = 'Peashooter',
  Sunflower = 'Sunflower',
  CherryBomb = 'Cherry Bomb',
  WallNut = 'Wall-nut',
  PotatoMine = 'Potato Mine',
  SnowPea = 'Snow Pea',
  Chomper = 'Chomper',
  Repeater = 'Repeater',
}
