import type {User} from '@/api'

/**
 *
 *
 * @export
 * @interface AuthLoginBody
 */
export interface AuthLoginBody extends User {
  /**
   * @type {any}
   * @memberof AuthLoginBody
   */
  uid?: any

  /**
   * @type {any}
   * @memberof AuthLoginBody
   */
  firstname?: any

  /**
   * @type {any}
   * @memberof AuthLoginBody
   */
  lastname?: any

  /**
   * @type {any}
   * @memberof AuthLoginBody
   */
  avatarRef?: any
}
