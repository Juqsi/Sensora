import type {Group, InlineResponse2003Members} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse2003
 */
export interface InlineResponse2003 extends Group {
  /**
   * @type {any}
   * @memberof InlineResponse2003
   */
  rooms?: any

  /**
   * @type {Array<InlineResponse2003Members>}
   * @memberof InlineResponse2003
   */
  members: Array<InlineResponse2003Members>
}
