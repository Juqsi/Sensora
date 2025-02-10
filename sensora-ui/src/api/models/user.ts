/**
 *
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   * Eindeutiger Benutzername, kann nicht doppelt vergeben werden
   *
   * @type {string}
   * @memberof User
   * @example testuser
   */
  username?: string

  /**
   * Muss den Passwortrichtlinien entsprechen:    Min. 8 Zeichen,   Max. 100 Zeichen,   Min. 1 Sonderzeichen,   Min. 1 Ziffer,   Min. 1 Großbuchstabe,   Min. 1 Kleinbuchstabe,   Unerlaubte Zeichen: @
   *
   * @type {string}
   * @memberof User
   * @example Test!1234
   */
  password?: string

  /**
   * Eindeutige E-Mail, kann nicht doppelt vergeben werden
   *
   * @type {string}
   * @memberof User
   * @example testuser@sensora.com
   */
  mail?: string

  /**
   * Eindeutige ID. Verändert sich, wenn `username` oder `mail` geändert wird.
   *
   * @type {string}
   * @memberof User
   * @example 7aa91e15-ba7f-4afb-8b56-f1f8c15642c6
   */
  uid?: string

  /**
   * Liste der Gruppen, denen der User angehört/angehören wird.
   *
   * @type {Array<string>}
   * @memberof User
   */
  groupIds?: Array<string>

  /**
   * @type {string}
   * @memberof User
   * @example Max
   */
  firstname?: string

  /**
   * @type {string}
   * @memberof User
   * @example Mustermann
   */
  lastname?: string

  /**
   * @type {string}
   * @memberof User
   * @example Peashooter
   */
  avatarRef?: UserAvatarRefEnum
}

/**
 * @export
 * @enum {string}
 */
export enum UserAvatarRefEnum {
  Peashooter = 'Peashooter',
  Sunflower = 'Sunflower',
  CherryBomb = 'Cherry Bomb',
  WallNut = 'Wall-nut',
  PotatoMine = 'Potato Mine',
  SnowPea = 'Snow Pea',
  Chomper = 'Chomper',
  Repeater = 'Repeater',
}
