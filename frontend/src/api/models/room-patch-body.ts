import {type Room} from '@/api'

/**
 *
 *
 * @export
 * @interface RoomPatchBody
 */
export interface RoomPatchBody extends Omit<Room, 'rid' | 'plants' | 'owner'> {}
