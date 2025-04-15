import { defineStore } from 'pinia'
import type { createGroupBody, Group, GroupPatchBody } from '@/api'
import { groupApiClient } from '@/api'
import i18n from '@/i18n'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'
import { useUserStore } from '@/stores'

const t = i18n.global?.t || ((key: string) => key)

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [] as Group[],
  }),

  actions: {
    async fetchGroups(force = false) {
      if (this.groups.length > 0 && !force) return
      const response = await groupApiClient.get()
      this.groups = response.data
    },

    async deleteGroup(groupId: string) {
      await groupApiClient.delete(groupId)
      this.groups = this.groups.filter((g) => g.gid !== groupId)
    },

    async removeUserFromGroup(groupId: string, userId: string) {
      const response = await groupApiClient.kick(groupId, userId, {
        meta: { successMessage: t('group.userRemoved') },
      } as CustomAxiosRequestConfig)
      const updatedGroup = response.data
      const userStore = useUserStore()
      if (userId === userStore.user?.uid) {
        this.groups = this.groups.filter((g) => g.gid !== groupId)
      } else {
        this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
      }
    },

    async leaveGroup(groupId: string) {
      await groupApiClient.leave(groupId, {
        meta: { successMessage: t('group.left') },
      } as CustomAxiosRequestConfig)
      this.groups = this.groups.filter((g) => g.gid !== groupId)
    },

    async updateGroup(groupId: string, body: GroupPatchBody): Promise<Group> {
      const response = await groupApiClient.update(body, groupId, {
        meta: { successMessage: t('group.updated') },
      } as CustomAxiosRequestConfig)
      const updatedGroup = response.data
      this.groups = this.groups.map((g) => (g.gid === groupId ? updatedGroup : g))
      return updatedGroup
    },

    async joinGroup(token: string): Promise<Group> {
      const response = await groupApiClient.join(token, {
        meta: { successMessage: t('group.joined') },
      } as CustomAxiosRequestConfig)
      this.groups.push(response.data)
      return response.data
    },

    async createGroup(body: createGroupBody): Promise<Group> {
      const response = await groupApiClient.create(body, {
        meta: { successMessage: t('group.created') },
      } as CustomAxiosRequestConfig)
      this.groups.push(response.data)
      return response.data
    },

    clearData() {
      this.groups = []
    },
  },
  persist: {
    storage: localStorage,
  },
})
