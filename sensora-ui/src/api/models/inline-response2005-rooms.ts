import type {InlineResponse2005Plants} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse2005Rooms
 */
export interface InlineResponse2005Rooms {
  /**
   * @type {any}
   * @memberof InlineResponse2005Rooms
   */
  owner: any

  /**
   * @type {Array<InlineResponse2005Plants>}
   * @memberof InlineResponse2005Rooms
   */
  plants?: Array<InlineResponse2005Plants>
}
