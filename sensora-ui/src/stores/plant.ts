import { defineStore } from 'pinia'
import type { Plant, PlantPatchBody, PlantPostBody } from '@/api'
import { PflanzenverwaltungApiFactory } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'
import apiClient from '@/api/apiClient'
import { useRoomStore } from '@/stores/room'
import { useGroupStore } from '@/stores/group'
import i18n from '@/i18n/i18n.ts'

const plantApi = PflanzenverwaltungApiFactory(undefined, undefined, apiClient)

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
  const groupStore = useRoomStore()
  groupStore.rooms.forEach((room) => {
    if (room.rid === roomId) {
      room.plants = room.plants?.map((plant) =>
        plant.plantId === updatedPlant.plantId ? updatedPlant : plant,
      ) || [updatedPlant]
    }
  })
}

const updateGroupWithPlant = async (updatedPlant: Plant) => {
  const groupStore = useGroupStore()
  groupStore.groups.forEach((group) => {
    if (group.gid) {
      group.rooms?.forEach((room) => {
        if (room.plants) {
          room.plants = room.plants.map((plant) =>
            plant.plantId === updatedPlant.plantId ? updatedPlant : plant,
          )
        }
      })
    }
  })
}

export const usePlantStore = defineStore('plant', {
  state: () => ({
    plants: [] as Plant[],
    loading: false,
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

    async createPlant(plantData: PlantPostBody) {
      this.loading = true
      try {
        const response = await plantApi.plantPost(plantData)
        const newPlant = response.data

        this.plants.push(newPlant)

        await Promise.all([
          updateRoomWithPlant(plantData.room, newPlant),
          updateGroupWithPlant(newPlant),
        ])

        toast.success(t('plant.created'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async deletePlant(plantId: string) {
      this.loading = true
      try {
        await plantApi.plantPlantIdDelete(plantId)

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
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async updatePlant(plantId: string, plantData: PlantPatchBody) {
      this.loading = true
      try {
        const response = await plantApi.plantPlantIdPatch(plantData, plantId)
        const updatedPlant = response.data

        this.plants = this.plants.map((plant) => (plant.plantId === plantId ? updatedPlant : plant))

        await Promise.all([
          updateRoomWithPlant(updatedPlant.room, updatedPlant),
          updateGroupWithPlant(updatedPlant),
        ])

        toast.success(t('plant.updated'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async getPlantDetails(
      plantId: string,
      startTime?: Date,
      endTime?: Date,
      force: boolean = false,
    ) {
      try {
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
        const response = await plantApi.plantPlantIdGet(plantId, startTime, endTime)
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
      } catch (error) {
        handleApiError(error)
        return null
      }
    },

    clearData() {
      this.plants = []
    },
  },
})
