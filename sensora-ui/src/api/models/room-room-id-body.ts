import {type Room} from '@/api'

/**
 *
 *
 * @export
 * @interface RoomRoomIdBody
 */
export interface RoomRoomIdBody extends Room {
  /**
   * @type {any}
   * @memberof RoomRoomIdBody
   */
  plants?: any

  /**
   * @type {any}
   * @memberof RoomRoomIdBody
   */
  owner?: any
}
