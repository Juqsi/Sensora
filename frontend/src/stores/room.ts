import { defineStore } from 'pinia'
import { useGroupStore } from './group'
import type { createRoomBody, Room, RoomPatchBody } from '@/api'
import { roomsApiClient } from '@/api'
import i18n from '@/i18n'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'

const t = i18n.global?.t || ((key: string) => key)

export const useRoomStore = defineStore('room', {
  state: () => {
    const groupStore = useGroupStore()
    return {
      rooms: [] as Room[],
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

    async createRoom(room: createRoomBody) {
      const response = await roomsApiClient.create(room)
      const newRoom = response.data

      const group = this.groupStore.groups.find((g) => g.gid === room.groupId)

      if (group) {
        group.rooms = [...(group.rooms || []), newRoom]
      }

      this.rooms.push(newRoom)
    },

    async deleteRoom(roomId: string, groupId: string) {
      await roomsApiClient.delete(roomId, {
        meta: { successMessage: t('room.deleted') },
      } as CustomAxiosRequestConfig)

      const group = this.groupStore.groups.find((g) => g.gid === groupId)
      if (group) {
        group.rooms = group.rooms?.filter((room) => room.rid !== roomId)
      }

      this.rooms = this.rooms.filter((room) => room.rid !== roomId)
    },

    async updateRoom(groupId: string, roomId: string, name: string) {
      const roomData: RoomPatchBody = { groupId, name }
      const response = await roomsApiClient.update(roomData, roomId, {
        meta: { successMessage: t('room.updated') },
      } as CustomAxiosRequestConfig)
      const updatedRoom = response.data

      const group = this.groupStore.groups.find((g) => g.gid === groupId)
      if (group) {
        group.rooms = group.rooms?.map((room) => (room.rid === roomId ? updatedRoom : room))
      }

      this.rooms = this.rooms.map((room) => (room.rid === roomId ? updatedRoom : room))
    },

    async getRoomDetails(roomId: string, force = false) {
      if (force || !this.rooms.some((room) => room.rid === roomId)) {
        const response = await roomsApiClient.get(roomId)
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
      } else {
        const room = this.rooms.find((room) => room.rid === roomId)
        return room || null
      }
    },

    clearData() {
      this.rooms = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
