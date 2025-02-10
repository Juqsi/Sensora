import type {Group, User} from '@/api'

/**
 *
 *
 * @export
 * @interface GroupBody
 */
export interface GroupBody extends Group {
  /**
   * @type {any}
   * @memberof GroupBody
   */
  gid?: any

  /**
   * @type {any}
   * @memberof GroupBody
   */
  rooms?: any

  /**
   * @type {Array<User & any>}
   * @memberof GroupBody
   */
  members?: Array<User & any>
}
