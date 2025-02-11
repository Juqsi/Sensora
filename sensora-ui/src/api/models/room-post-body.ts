import type {Room} from "@/api";

/**
 *
 *
 * @export
 * @interface RoomPostBody
 */
export interface RoomPostBody extends Omit<Room, 'rid' | 'owner' | 'plants'> {
  /**
   * @type {string}
   * @memberof RoomPostBody
   * @example 7aa91e15-ba7f-4afb-8b56-f1f8c15642c6
   */
  groupId: string

  /**
   * @type {string}
   * @memberof RoomPostBody
   * @example Wohnzimmer
   */
  name: string
}
