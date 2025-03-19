import type { Plant, Sensor, Value } from '@/api'

export function latestSensorValue(plants: Plant[], ilk: string): Value | undefined {
  const allValues: Value[] = []
  // 1. Iteriere über alle Pflanzen
  plants.forEach((plant) => {
    console.log(plant)
    if (!plant) {
      console.log(plant)
      return // Überspringe, wenn plant undefined ist
    }
    // 2. Iteriere über alle Controller der Pflanze
    plant.controllers?.forEach((controller) => {
      // 3. Filtere die Sensoren nach dem Typ
      const filteredSensors =
        controller.sensors?.filter((sensor: Sensor) => sensor.ilk === ilk) ?? []

      // 4. Alle Values in ein Array pushen
      filteredSensors.forEach((sensor) => {
        allValues.push(...sensor.values)
      })
    })
  })

  // 5. Wenn keine Werte vorhanden sind, gib undefined zurück
  if (allValues.length === 0) {
    return undefined
  }

  // 6. Neuesten Wert finden
  return allValues.reduce(
    (prev, curr) =>
      new Date(curr.timestamp).getTime() > new Date(prev.timestamp).getTime() ? curr : prev,
    allValues[0],
  )
}
