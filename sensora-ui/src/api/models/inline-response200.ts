import type {User} from '@/api'

/**
 *
 *
 * @export
 * @interface InlineResponse200
 */
export interface InlineResponse200 extends User {
  /**
   * @type {string}
   * @memberof InlineResponse200
   */
  token: string
}
