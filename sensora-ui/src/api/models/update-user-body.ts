import { type User } from '@/api'

/**
 *
 *
 * @export
 * @interface updateUserBody
 */
export interface updateUserBody extends Omit<User, 'uid' | 'groupIds'> {}
