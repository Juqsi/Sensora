import { defineStore } from 'pinia'
import type { createPlantBody, Plant, updatePlantBody } from '@/api'
import { plansApiClient } from '@/api'
import { toast } from 'vue-sonner'
import { useRoomStore } from '@/stores/room'
import { useGroupStore } from '@/stores/group'
import i18n from '@/i18n'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'

const t = i18n.global?.t || ((key: string) => key)

const removePlantFromRoom = (roomId: string, plantId: string) => {
  const roomStore = useRoomStore()
  const room = roomStore.rooms.find((room) => room.rid === roomId)
  if (room && room.plants) {
    room.plants = room.plants.filter((plant) => plant.plantId !== plantId)
  }
}

const removePlantFromGroup = (plantId: string) => {
  const groupStore = useGroupStore()
  groupStore.groups.forEach((group) => {
    group.rooms?.forEach((room) => {
      if (room.plants) {
        room.plants = room.plants.filter((plant) => plant.plantId !== plantId)
      }
    })
  })
}

const updateRoomWithPlant = async (roomId: string, updatedPlant: Plant) => {
  const roomStore = useRoomStore()

  roomStore.rooms.forEach((room) => {
    if (room.rid === roomId) {
      const plantIndex = room.plants?.findIndex((plant) => plant.plantId === updatedPlant.plantId)

      if (plantIndex !== undefined && plantIndex !== -1) {
        room.plants?.splice(plantIndex, 1, updatedPlant)
      } else {
        room.plants?.push(updatedPlant)
      }
    }
  })
}

const updateGroupWithPlant = async (updatedPlant: Plant) => {
  const groupStore = useGroupStore()
  groupStore.groups.forEach((group) => {
    group.rooms?.forEach((room) => {
      const plantIndex = room.plants?.findIndex((plant) => plant.plantId === updatedPlant.plantId)
      if (plantIndex !== undefined && plantIndex !== -1) {
        room.plants.splice(plantIndex, 1, updatedPlant)
      }
    })
  })
}

export const usePlantStore = defineStore('plant', {
  state: () => ({
    plants: [] as Plant[],
  }),

  actions: {
    async fetchPlants(force = false) {
      const groupStore = useGroupStore()
      const groups = groupStore.groups

      if (groups.length > 0 && !force) {
        this.plants = groups.reduce((accumulatedPlants, group) => {
          if (group.rooms) {
            group.rooms.forEach((room) => {
              if (room.plants) {
                accumulatedPlants.push(...room.plants)
              }
            })
          }
          return accumulatedPlants
        }, [] as Plant[])
        return
      }

      await groupStore.fetchGroups(true)
      this.plants = groupStore.groups.reduce((accumulatedPlants, group) => {
        if (group.rooms) {
          group.rooms.forEach((room) => {
            if (room.plants) {
              accumulatedPlants.push(...room.plants)
            }
          })
        }
        return accumulatedPlants
      }, [] as Plant[])
    },

    async createPlant(plantData: createPlantBody) {
      const response = await plansApiClient.create(plantData, {
        meta: {
          successMessage: t('plant.created'),
        },
      } as CustomAxiosRequestConfig)
      const newPlant = response.data

      this.plants.push(newPlant)
      await Promise.all([
        updateRoomWithPlant(plantData.room, newPlant),
        updateGroupWithPlant(newPlant),
      ])
    },

    async deletePlant(plantId: string) {
      await plansApiClient.delete(plantId)

      const plantToDelete = this.plants.find((plant) => plant.plantId === plantId)

      if (plantToDelete) {
        const roomId = plantToDelete.room

        this.plants = this.plants.filter((plant) => plant.plantId !== plantId)

        removePlantFromRoom(roomId, plantId)
        removePlantFromGroup(plantId)

        toast.success(t('plant.deleted'))
      } else {
        toast.error(t('plant.notFound'))
      }
    },

    async updatePlant(plantId: string, plantData: updatePlantBody) {
      const response = await plansApiClient.update(plantData, plantId, {
        meta: { successMessage: t('plant.updated') },
      } as CustomAxiosRequestConfig)
      const updatedPlant = response.data

      this.plants = this.plants.map((plant) => (plant.plantId === plantId ? updatedPlant : plant))

      await Promise.all([
        updateRoomWithPlant(updatedPlant.room, updatedPlant),
        updateGroupWithPlant(updatedPlant),
      ])
    },

    async getPlantDetails(
      plantId: string,
      startTime?: Date,
      endTime?: Date,
      force: boolean = false,
    ) {
      const existingPlant = this.plants.find((plant) => plant.plantId === plantId)

      if (force || (existingPlant && startTime && endTime)) {
        const start = startTime || new Date(0)
        const end = endTime || new Date()

        // Überprüfe, ob der Zeitraum durch bestehende Messwerte abgedeckt ist
        const isCovered = existingPlant?.controllers?.some((controller) =>
          controller.sensors?.some((sensor) =>
            sensor.values?.some((value) => {
              const timestamp = new Date(value.timestamp || 0)
              return timestamp >= start && timestamp <= end
            }),
          ),
        )

        // Wenn der Zeitraum bereits abgedeckt ist und force nicht gesetzt ist, überspringe den API-Aufruf
        if (isCovered && !force) {
          return existingPlant
        }
      }

      // Wenn der Zeitraum nicht abgedeckt ist oder die Pflanze noch nicht existiert
      const response = await plansApiClient.get(plantId, startTime, endTime)
      const updatedPlant = response.data

      // Kombiniere die neuen Sensorwerte mit den bestehenden Werten
      if (existingPlant) {
        updatedPlant.controllers?.forEach((controller) => {
          controller.sensors?.forEach((sensor) => {
            const existingSensor = existingPlant.controllers
              ?.find((ctrl) => ctrl.did === controller.did)
              ?.sensors?.find((existingSensor) => existingSensor.sid === sensor.sid)

            if (existingSensor) {
              sensor.values?.forEach((newValue) => {
                const existingValue = existingSensor.values?.find(
                  (val) => val.timestamp === newValue.timestamp,
                )
                if (!existingValue) {
                  existingSensor.values?.push(newValue)
                }
              })
            } else {
              existingPlant.controllers?.push(controller)
            }
          })
        })
      } else {
        this.plants.push(updatedPlant)
        await updateRoomWithPlant(updatedPlant.room, updatedPlant)
        await updateGroupWithPlant(updatedPlant)
      }

      return updatedPlant
    },

    clearData() {
      this.plants = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
