import {type User} from '@/api'

/**
 *
 *
 * @export
 * @interface UserPatchBody
 */
export interface UserPatchBody extends Omit<User, 'uid' | 'groupIds'> {}
