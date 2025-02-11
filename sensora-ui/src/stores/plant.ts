import { defineStore } from 'pinia'
import type { Plant, PlantPatchBody, PlantPostBody, PlantTargetValues } from '@/api'
import { PflanzenverwaltungApiFactory } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import apiClient from '@/api/apiClient'
import { useRoomStore } from '@/stores/room'
import { useGroupStore } from '@/stores/group'

const plantApi = PflanzenverwaltungApiFactory(undefined, undefined, apiClient)

const { t } = useI18n()

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

// Helper: Pflanze im Raum aktualisieren
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

// Helper: Pflanze in der Gruppe aktualisieren
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

    async createPlant(
      roomId: string,
      name: string,
      plantType?: string,
      note?: string,
      targetValues?: PlantTargetValues[],
    ) {
      this.loading = true
      try {
        const plantData: PlantPostBody = {
          room: roomId,
          name,
          plantType,
          note,
          targetValues,
        }

        const response = await plantApi.plantPost(plantData)
        const newPlant = response.data

        this.plants.push(newPlant)

        await Promise.all([updateRoomWithPlant(roomId, newPlant), updateGroupWithPlant(newPlant)])

        toast.success(t('plant.created'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async deletePlant(plantId: string, roomId: string) {
      this.loading = true
      try {
        await plantApi.plantPlantIdDelete(plantId)

        this.plants = this.plants.filter((plant) => plant.plantId !== plantId)

        removePlantFromRoom(roomId, plantId)
        removePlantFromGroup(plantId)

        toast.success(t('plant.deleted'))
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

    async getPlantDetails(plantId: string) {
      try {
        const response = await plantApi.plantPlantIdGet(plantId)
        return response.data
      } catch (error) {
        handleApiError(error)
        return null
      }
    },

    async clearPlants() {
      this.plants = []
    },
  },
})
