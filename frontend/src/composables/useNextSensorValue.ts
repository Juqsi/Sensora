import type { Plant, Value, Sensor } from '@/api'

export function nextValue(
  plantData: Plant[],
  targetDate: Date,
  targetIlk: string,
): Value | undefined {
  // Wandelt das targetDate in Millisekunden um
  const targetTime = targetDate.getTime()

  // Iteriere durch alle Plants und deren Sensoren, um den nächsten Wert zu finden
  return plantData.reduce((closest: Value | undefined, plant) => {
    // Iteriere durch alle Controller des Plants
    for (const controller of plant.controllers) {
      // Iteriere durch alle Sensoren des Controllers
      for (const sensor of controller.sensors) {
        // Prüfe, ob der Sensor den gewünschten ilk hat
        if (sensor.ilk === targetIlk) {
          // Iteriere durch alle Werte des Sensors
          const closestSensor = sensor.values.reduce(
            (sensorClosest: Value, currentValue: Value) => {
              const currentTime = new Date(currentValue.timestamp).getTime()
              const sensorClosestTime = new Date(sensorClosest.timestamp).getTime()

              // Berechne den Zeitunterschied
              const currentDiff = Math.abs(currentTime - targetTime)
              const closestDiff = Math.abs(sensorClosestTime - targetTime)

              // Wenn der aktuelle Wert näher am Ziel-Timestamp ist, setze ihn als nächsten Wert
              return currentDiff < closestDiff ? currentValue : sensorClosest
            },
            sensor.values[0],
          ) // Beginne mit dem ersten Wert des Sensors

          // Vergleiche den besten Wert des aktuellen Sensors mit dem besten Wert insgesamt
          const closestControllerTime = new Date(closestSensor.timestamp).getTime()
          if (
            !closest ||
            Math.abs(closestControllerTime - targetTime) >
              Math.abs(new Date(closestSensor.timestamp).getTime() - targetTime)
          ) {
            closest = closestSensor
          }
        }
      }
    }
    return closest
  }, undefined)
}
