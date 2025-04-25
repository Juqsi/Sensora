import { type Controller, SensorStatusEnum } from '@/api'

export function getActiveController(controllers?: Controller[]) {
  if (!controllers) {
    return []
  }
  return controllers.filter((controller) => controller.sensors.some((sensor) => sensor.currently_assigned ?? false))
}

export function getStatus(controller: Controller) {
  if (controller.sensors.length === 0) {
    return SensorStatusEnum.Inactive
  }

  const hasError =
    controller.sensors.some(sensor => sensor.status === 'error')


  return hasError ? SensorStatusEnum.Error : SensorStatusEnum.Active
}
