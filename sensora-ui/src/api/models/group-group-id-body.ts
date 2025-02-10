import type {Group} from '@/api'

/**
 *
 *
 * @export
 * @interface GroupGroupIdBody
 */
export interface GroupGroupIdBody extends Group {
  /**
   * @type {any}
   * @memberof GroupGroupIdBody
   */
  members?: any

  /**
   * @type {any}
   * @memberof GroupGroupIdBody
   */
  rooms?: any
}
