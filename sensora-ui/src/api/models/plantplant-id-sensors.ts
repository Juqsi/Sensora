import type {Sensor} from '@/api'

/**
 *
 *
 * @export
 * @interface PlantplantIdSensors
 */
export interface PlantplantIdSensors extends Omit<Sensor, 'sid'> {}
