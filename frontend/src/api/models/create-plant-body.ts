import type { Plant } from '@/api'

/**
 *
 *
 * @export
 * @interface createPlantBody
 */
export interface createPlantBody extends Omit<Plant, 'plantId' | 'controllers'> {
  assignFullDevice?: string[]
  sensors?: Array<string>
}
