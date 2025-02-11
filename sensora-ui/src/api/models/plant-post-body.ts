import type {Plant} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantPostBody
 */
export interface PlantPostBody extends Omit<Plant, 'plantId'> {}
