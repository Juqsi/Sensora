import type { Room } from '@/api'

/**
 *
 *
 * @export
 * @interface createRoomBody
 */
export interface createRoomBody extends Omit<Room, 'rid' | 'owner' | 'plants'> {
  /**
   * @type {string}
   * @memberof createRoomBody
   * @example 7aa91e15-ba7f-4afb-8b56-f1f8c15642c6
   */
  groupId: string

  /**
   * @type {string}
   * @memberof createRoomBody
   * @example Wohnzimmer
   */
  name: string
}
