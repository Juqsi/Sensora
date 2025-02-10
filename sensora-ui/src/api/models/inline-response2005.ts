import type {Group, InlineResponse2005Rooms} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse2005
 */
export interface InlineResponse2005 extends Group {
  /**
   * @type {Array<any>}
   * @memberof InlineResponse2005
   */
  members?: Array<any>

  /**
   * @type {Array<InlineResponse2005Rooms>}
   * @memberof InlineResponse2005
   */
  rooms?: Array<InlineResponse2005Rooms>
}
