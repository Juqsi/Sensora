import { defineStore } from 'pinia'
import { useGroupStore } from './group'
import type { Room, RoomPatchBody, RoomPostBody } from '@/api'
import { RaumverwaltungApiFactory } from '@/api'
import { handleApiError } from '@/utils/apiErrorHandler'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'

import apiClient from '@/api/apiClient'

const roomApi = RaumverwaltungApiFactory(undefined, undefined, apiClient)
const t = i18n.global?.t || ((key: string) => key)

export const useRoomStore = defineStore('room', {
  state: () => {
    const groupStore = useGroupStore()
    return {
      rooms: [] as Room[],
      loading: false,
      groupStore,
    }
  },

  actions: {
    async fetchRooms(force = false) {
      const groups = this.groupStore.groups

      if (groups.length > 0 && !force) {
        this.rooms = this.groupStore.groups.reduce((accumulatedRooms, group) => {
          if (group.rooms) {
            accumulatedRooms.push(...group.rooms)
          }
          return accumulatedRooms
        }, [] as Room[])
        return
      }

      await this.groupStore.fetchGroups(true)
      this.rooms = this.groupStore.groups.reduce((accumulatedRooms, group) => {
        if (group.rooms) {
          accumulatedRooms.push(...group.rooms)
        }
        return accumulatedRooms
      }, [] as Room[])
    },

    async createRoom(groupId: string, name: string) {
      this.loading = true
      try {
        const roomData: RoomPostBody = { groupId, name }
        const response = await roomApi.roomPost(roomData)
        const newRoom = response.data

        const group = this.groupStore.groups.find((g) => g.gid === groupId)

        if (group) {
          group.rooms = [...(group.rooms || []), newRoom]
        }

        this.rooms.push(newRoom)

        toast.success(t('room.created'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteRoom(roomId: string, groupId: string) {
      this.loading = true
      try {
        await roomApi.roomRoomIdDelete(roomId)

        const group = this.groupStore.groups.find((g) => g.gid === groupId)
        if (group) {
          group.rooms = group.rooms?.filter((room) => room.rid !== roomId)
        }

        this.rooms = this.rooms.filter((room) => room.rid !== roomId)

        toast.success(t('room.deleted'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async updateRoom(groupId: string, roomId: string, name: string) {
      this.loading = true
      try {
        const roomData: RoomPatchBody = { groupId, name }
        const response = await roomApi.roomRoomIdPatch(roomData, roomId)
        const updatedRoom = response.data

        const group = this.groupStore.groups.find((g) => g.gid === groupId)
        if (group) {
          group.rooms = group.rooms?.map((room) => (room.rid === roomId ? updatedRoom : room))
        }

        this.rooms = this.rooms.map((room) => (room.rid === roomId ? updatedRoom : room))

        toast.success(t('room.updated'))
      } catch (error) {
        handleApiError(error)
      } finally {
        this.loading = false
      }
    },

    async getRoomDetails(roomId: string, force = false) {
      if (force || !this.rooms.some((room) => room.rid === roomId)) {
        try {
          const response = await roomApi.roomRoomIdGet(roomId)
          const updatedRoom = response.data

          const roomIndex = this.rooms.findIndex((room) => room.rid === roomId)
          if (roomIndex !== -1) {
            this.rooms[roomIndex] = updatedRoom
          } else {
            this.rooms.push(updatedRoom)
          }

          const groups = this.groupStore.groups

          const group = groups.find((g) => g.gid === updatedRoom.groupId)
          if (group) {
            const roomInGroupIndex = group.rooms?.findIndex((room) => room.rid === roomId)
            if (roomInGroupIndex !== -1) {
              group.rooms = group.rooms?.map((room) => (room.rid === roomId ? updatedRoom : room))
            } else {
              group.rooms?.push(updatedRoom)
            }
          }

          return updatedRoom
        } catch (error) {
          handleApiError(error)
          return null
        }
      } else {
        const room = this.rooms.find((room) => room.rid === roomId)
        return room || null
      }
    },

    clearData() {
      this.rooms = []
    },
  },
})
