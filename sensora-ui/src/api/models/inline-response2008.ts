import type {InlineResponse2008Plants, Room} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse2008
 */
export interface InlineResponse2008 extends Room {
  /**
   * @type {any}
   * @memberof InlineResponse2008
   */
  owner: any

  /**
   * @type {Array<InlineResponse2008Plants>}
   * @memberof InlineResponse2008
   */
  plants?: Array<InlineResponse2008Plants>
}
