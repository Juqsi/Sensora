import { type User, UserAvatarRefEnum } from '@/api'

/**
 *
 *
 * @export
 * @interface updateUserBody
 */
export interface updateUserBody
  extends Omit<User, 'uid' | 'groupIds' | 'username' | 'mail' | 'firstname'> {
  username?: string
  mail?: string
  firstname?: string
  avatarRef?: UserAvatarRefEnum
}
