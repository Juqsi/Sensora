import type {Group} from '@/api'

/**
 *
 *
 * @export
 * @interface createGroupBody
 */
export interface createGroupBody extends Omit<Group, 'gid' | 'rooms'> {}
