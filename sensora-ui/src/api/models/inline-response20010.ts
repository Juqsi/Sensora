import type {InlineResponse2008Controllers, Plant} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse20010
 */
export interface InlineResponse20010 extends Plant {
  /**
   * @type {Array<InlineResponse2008Controllers>}
   * @memberof InlineResponse20010
   */
  controllers?: Array<InlineResponse2008Controllers>

  /**
   * @type {Array<any>}
   * @memberof InlineResponse20010
   */
  targetValues?: Array<any>
}
