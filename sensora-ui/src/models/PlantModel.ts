interface Plant {
  id: string
  name: string
  species: string
  waterNeed: string // Kann z.B. "hoch", "mittel", "gering" sein
  sunlightNeed: string // z.B. "viel", "wenig"
  temperatureRange: string // z.B. "18-22°C"
  lastWatered: Date
  userId: string
}

interface UpdatePlantModel {
  name: string
  sensorUuid: string
  room: string
  plantType: string
}

export type { Plant, UpdatePlantModel }
