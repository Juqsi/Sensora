import { type updateUserBody, type User } from '@/api/models'

/**
 *
 *
 * @export
 * @interface AuthRegisterBody
 */
export interface AuthRegisterBody extends updateUserBody {
  /**
   * Muss den Passwortrichtlinien entsprechen:    Min. 8 Zeichen,   Max. 100 Zeichen,   Min. 1 Sonderzeichen,   Min. 1 Ziffer,   Min. 1 Großbuchstabe,   Min. 1 Kleinbuchstabe,   Unerlaubte Zeichen: @
   *
   * @type {string}
   * @memberof User
   * @example Test!1234
   */
  password: string
}
