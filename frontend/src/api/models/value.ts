/**
 *
 *
 * @export
 * @interface Value
 */
export interface Value {
  /**
   * Zeitpunkt, an dem der Wert gemessen wurde
   *
   * @type {string}
   * @memberof Value
   * @example 2024-12-16T12:00:00Z
   */
  timestamp: string

  /**
   * Wert
   *
   * @type {number}
   * @memberof Value
   * @example 5.3
   */
  value: number
}
