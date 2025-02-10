import {type User} from '@/api/models'

/**
 *
 *
 * @export
 * @interface AuthRegisterBody
 */
export interface AuthRegisterBody extends User {
  /**
   * @type {any}
   * @memberof AuthRegisterBody
   */
  uid?: any
}
