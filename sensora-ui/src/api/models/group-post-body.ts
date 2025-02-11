import type {Group} from '@/api'

/**
 *
 *
 * @export
 * @interface GroupPostBody
 */
export interface GroupPostBody extends Omit<Group, 'gid' | 'members' | 'rooms'> {}
