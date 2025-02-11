import type {Group} from '@/api'

/**
 *
 *
 * @export
 * @interface GroupPatchBody
 */
export interface GroupPatchBody extends Group {
  /**
   * @type {any}
   * @memberof GroupPatchBody
   */
  members?: any

  /**
   * @type {any}
   * @memberof GroupPatchBody
   */
  rooms?: any
}
