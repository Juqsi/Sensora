import {type User} from '@/api'

/**
 *
 *
 * @export
 * @interface UserBody
 */
export interface UserBody extends User {
  /**
   * @type {any}
   * @memberof UserBody
   */
  password?: any

  /**
   * Wenn nicht angegeben, wird mit `Peashooter` ersetzt.
   *
   * @type {any}
   * @memberof UserBody
   */
  avatarRef?: any

  /**
   * Eindeutige E-Mail Adresse, kann nicht doppelt vergeben werden. Wenn die E-Mail hier geändert wird, muss sie erneut bestätigt werden, bevor der Benutzeraccount weiter verwendet werden kann. In der Staging-Umgebung wird dieser Prozess übersprungen.
   *
   * @type {any}
   * @memberof UserBody
   */
  mail?: any
}
