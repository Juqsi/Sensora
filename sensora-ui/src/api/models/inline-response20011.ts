import type {Controller, InlineResponse20011Sensors} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse20011
 */
export interface InlineResponse20011 extends Controller {
  /**
   * @type {any}
   * @memberof InlineResponse20011
   */
  owner: any

  /**
   * @type {Array<InlineResponse20011Sensors>}
   * @memberof InlineResponse20011
   */
  sensors?: Array<InlineResponse20011Sensors>
}
